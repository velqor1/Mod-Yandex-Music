"""Build Fedora RPM inputs and a portable archive from the pinned Linux client."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import struct
import tarfile
from pathlib import PurePosixPath
from tempfile import TemporaryDirectory

from desktop_package import ROOT, set_data

BASE_VERSION = "5.128.0"
DEB_NAME = f"Yandex_Music_amd64_{BASE_VERSION}.deb"
DEB_SHA512 = (
    "7f45cfd652f53eca4b0b8bb5a7ab6febda1c9d15377e162b606f1f040869039a9"
    "265450c758af977049d6c9012f68e12334cf19f604e5016be7e09a8c6c0a812"
)
MOD_VERSION = "0.3.0"
PACKAGING = ROOT / "tools/fedora-rpm"
CLIENT_PATH = PurePosixPath("opt/Яндекс Музыка")
INSTALL_PATH = PurePosixPath("opt/yandex-music-mod")
PAYLOAD = "yandex-music-mod-payload.tar.gz"


def upstream_data(package: bytes) -> tarfile.TarFile:
    if hashlib.sha512(package).hexdigest() != DEB_SHA512 or package[:8] != b"!<arch>\n":
        raise ValueError(f"Expected the verified official {DEB_NAME}")
    offset = 8
    while offset < len(package):
        member = package[offset:offset + 60]
        name = member[:16].decode("ascii").strip().rstrip("/")
        length = int(member[48:58])
        offset += 60
        if name == "data.tar.xz":
            return tarfile.open(fileobj=io.BytesIO(package[offset:offset + length]), mode="r|xz")
        offset += length + length % 2
    raise ValueError("Original package data was not found")


def patch_html(node: dict, body: bytearray, late_tag: bytes) -> int:
    patched = 0
    for name, child in node["files"].items():
        if "files" in child:
            patched += patch_html(child, body, late_tag)
        elif name.endswith(".html") and "offset" in child:
            offset = int(child["offset"])
            content = bytes(body[offset:offset + child["size"]])
            if content.count(b"<head>") != 1 or content.count(b"</head>") != 1:
                continue
            content = content.replace(b"</head>", late_tag + b"</head>", 1)
            append_asset(child, content, body)
            patched += 1
    return patched


def append_asset(node: dict, content: bytes, body: bytearray) -> None:
    # Reuse the Windows packer's integrity bookkeeping without copying the body per entry.
    set_data(node, content, b"")
    node["offset"] = str(len(body))
    body.extend(content)



def patch_archive(original: bytes, version: str) -> tuple[bytes, int]:
    _, header_size, _, json_size = struct.unpack_from("<IIII", original)
    header = json.loads(original[16:16 + json_size])
    body = bytearray(original[8 + header_size:])
    entries = header["files"]
    app = entries["app"]["files"]
    if "yandexMusicMod" in app:
        raise ValueError("Expected an unmodified upstream archive")

    def patch_entry(name: str, injection: bytes) -> None:
        entry = entries[name]
        start = int(entry["offset"])
        code = bytes(body[start:start + entry["size"]])
        append_asset(entry, code + b"\n;\n" + injection + b"\n", body)

    patch_entry("preload.js", (ROOT / "src/preload/mod-preload.js").read_bytes())
    patch_entry("index.js", b'require("./app/yandexMusicMod/main.js");')

    tags = (
        f'<script id="ym-mod-renderer-script" src="/yandexMusicMod/renderer.js" '
        f'data-fedora-base-version="{BASE_VERSION}" data-fedora-mod-version="{version}" defer></script>'
        '<link id="ym-mod-renderer-style" rel="stylesheet" href="/yandexMusicMod/renderer.css">'
    ).encode("ascii")
    pages = patch_html(entries["app"], body, tags)
    if not pages:
        raise ValueError("No application pages patched")

    assets = {
        "main.js": "src/main/mod-main.js",
        "settings.js": "src/main/settings.js",
        "discord-rpc.js": "src/main/discord-rpc.js",
        "renderer.js": "src/renderer/mod-renderer.js",
        "renderer.css": "src/renderer/mod-renderer.css",
        "overlay-preload.js": "src/preload/overlay-preload.js",
        "karaoke-preload.js": "src/preload/karaoke-preload.js",
    }
    for kind in ("overlay", "karaoke"):
        for extension in ("html", "js", "css"):
            name = f"{kind}.{extension}"
            assets[name] = f"src/{kind}/{name}"
    assets.update({font.name: font for font in sorted((ROOT / "src/fonts").glob("*.woff*"))})
    files = {}
    for name, source in assets.items():
        files[name] = {}
        append_asset(files[name], (ROOT / source).read_bytes(), body)

    app["yandexMusicMod"] = {"files": files}
    packed = json.dumps(header, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    padding = b"\0" * (-len(packed) % 4)
    aligned = len(packed) + len(padding)
    return struct.pack("<IIII", 4, aligned + 8, aligned + 4, len(packed)) + packed + padding + body, pages


def add_file(bundle: tarfile.TarFile, path: str, data: bytes, mode: int = 0o644) -> None:
    entry = tarfile.TarInfo(path)
    entry.mode = mode
    entry.size = len(data)
    bundle.addfile(entry, io.BytesIO(data))


def build_payload(deb: Path, output: Path, version: str, *, portable: bool = False) -> int:
    patched_pages = 0
    folder = PurePosixPath("YandexMusic-Mod-Fedora")
    install_path = folder / "client" if portable else INSTALL_PATH
    with (
        upstream_data(deb.read_bytes()) as upstream,
        tarfile.open(output, "w:gz", compresslevel=3) as bundle,
    ):
        for entry in upstream:
            path = PurePosixPath(entry.name)
            if path.is_relative_to(CLIENT_PATH):
                relative = path.relative_to(CLIENT_PATH)
                target = str(install_path / relative)
                if relative == PurePosixPath("resources/app.asar"):
                    modified, patched_pages = patch_archive(
                        upstream.extractfile(entry).read(), version=version
                    )
                    add_file(bundle, target, modified)
                    continue
                if relative == PurePosixPath("resources/package-type"):
                    add_file(bundle, target, b"portable" if portable else b"rpm")
                    continue
            elif path.is_relative_to("usr/share/icons/hicolor") and path.name == "yandexmusic.png":
                if portable:
                    continue
                target = str(path.with_name("yandex-music-mod.png"))
            else:
                continue

            # The pinned DEB ships regular files and directories here.
            if not (entry.isfile() or entry.isdir()):
                raise ValueError(f"Unexpected package member: {path}")
            entry.name = target
            bundle.addfile(entry, upstream.extractfile(entry) if entry.isfile() else None)

        if not patched_pages:
            raise ValueError("Original application archive was not found")
        launcher = (PACKAGING / "launch.sh").read_text(encoding="utf-8")
        desktop = (PACKAGING / "yandex-music-mod.desktop").read_text(encoding="utf-8")
        executable = str(folder / "launch.sh") if portable else "usr/bin/yandex-music-mod"
        add_file(bundle, executable, launcher.encode(), mode=0o755)
        if not portable:
            add_file(bundle, "usr/share/applications/yandex-music-mod.desktop", desktop.encode())
    return patched_pages


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("deb", type=Path)
    parser.add_argument("--work-dir", type=Path, default=ROOT / "build/fedora-rpm")
    parser.add_argument("--mod-version", type=str, default=MOD_VERSION)
    parser.add_argument("--portable", type=Path, help="Also create a portable tar.gz")
    args = parser.parse_args()
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", args.mod_version):
        parser.error("--mod-version must have the form X.Y.Z")

    work_dir = args.work_dir.resolve()
    sources = work_dir / "SOURCES"
    specs = work_dir / "SPECS"
    sources.mkdir(parents=True, exist_ok=True)
    specs.mkdir(parents=True, exist_ok=True)
    spec = (
        (PACKAGING / "yandex-music-mod.spec.in").read_text(encoding="utf-8")
        .replace("@MOD_VERSION@", args.mod_version)
        .replace("@BASE_VERSION@", BASE_VERSION)
        .replace("@PAYLOAD@", PAYLOAD)
    )

    with TemporaryDirectory(dir=work_dir) as temp:
        staging = Path(temp)
        pages = build_payload(args.deb, staging / PAYLOAD, args.mod_version)
        spec_path = staging / "yandex-music-mod.spec"
        spec_path.write_text(spec, encoding="utf-8", newline="\n")
        (staging / PAYLOAD).replace(sources / PAYLOAD)
        spec_path.replace(specs / spec_path.name)

    if args.portable:
        output = args.portable.resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        with TemporaryDirectory(dir=output.parent) as temp:
            pending = Path(temp) / output.name
            build_payload(args.deb, pending, args.mod_version, portable=True)
            pending.replace(output)

    print(f"Prepared {pages} app pages in {work_dir}")


if __name__ == "__main__":
    main()
