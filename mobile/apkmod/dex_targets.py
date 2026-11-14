"""Find methods referring to a constant string in an APK, without scanning smali trees.

Usage: python -X utf8 mobile/apkmod/dex_targets.py path.apk "string fragment"
Read-only; candidates are verified against the decoded method before patching.
"""
import argparse
import json
import struct
import zipfile


def uleb(data, offset):
    value = 0
    for shift in range(0, 35, 7):
        byte = data[offset]
        offset += 1
        value |= (byte & 127) << shift
        if byte < 128:
            return value, offset
    raise ValueError("Invalid ULEB128")


def find_references(data, fragment, exact=False, field=None, method_ref=None):
    def uint(offset): return struct.unpack_from("<I", data, offset)[0]
    strings_count, strings_offset = struct.unpack_from("<II", data, 0x38)
    strings = []
    for index in range(strings_count):
        start = uint(strings_offset + 4 * index)
        _, start = uleb(data, start)
        strings.append(data[start:data.index(0, start)].decode("utf-8", errors="replace"))
    wanted = {i: text for i, text in enumerate(strings)
              if fragment and (fragment.casefold() == text.casefold() if exact else fragment.casefold() in text.casefold())}
    type_offset = uint(0x44)
    member_needles = []
    for member, header, kind in [(field, 0x50, "field"), (method_ref, 0x58, "method")]:
        if member:
            count, offset = struct.unpack_from("<II", data, header)
            for i in range(count):
                position = offset + 8 * i
                class_index = struct.unpack_from("<H", data, position)[0]
                if strings[uint(type_offset + 4 * class_index)] == member[0] and strings[uint(position + 4)] == member[1]:
                    member_needles.append((i.to_bytes(2, "little"), kind, member[0] + "->" + member[1]))
    if not wanted and not member_needles:
        return
    method_offset = uint(0x5c)
    classes_count, classes_offset = struct.unpack_from("<II", data, 0x60)
    for index in range(classes_count):
        class_offset = classes_offset + 32 * index
        encoded = uint(class_offset + 24)
        if not encoded:
            continue
        counts = []
        for _ in range(4):
            count, encoded = uleb(data, encoded)
            counts.append(count)
        for _ in range(counts[0] + counts[1]):
            _, encoded = uleb(data, encoded)
            _, encoded = uleb(data, encoded)
        for count in counts[2:]:
            method_index = 0
            for _ in range(count):
                diff, encoded = uleb(data, encoded)
                method_index += diff
                _, encoded = uleb(data, encoded)
                code_offset, encoded = uleb(data, encoded)
                if not code_offset:
                    continue
                size = uint(code_offset + 12)
                code = data[code_offset + 16:code_offset + 16 + 2 * size]
                matches = []
                for needle, kind, label in member_needles:
                    offset = code.find(needle, 2)
                    while offset >= 0:
                        opcode = code[offset - 2]
                        valid = 0x52 <= opcode <= 0x6d if kind == "field" else (0x6e <= opcode <= 0x72 or 0x74 <= opcode <= 0x78)
                        if offset % 2 == 0 and valid:
                            matches.append(label)
                            break
                        offset = code.find(needle, offset + 1)
                for string_index, text in wanted.items():
                    widths = [4] if string_index > 65535 else [2, 4]
                    for width in widths:
                        needle = string_index.to_bytes(width, "little")
                        offset = code.find(needle, 2)
                        while offset >= 0:
                            if offset % 2 == 0 and code[offset - 2] == (0x1a if width == 2 else 0x1b):
                                matches.append(text)
                                break
                            offset = code.find(needle, offset + 1)
                        if matches and matches[-1] == text:
                            break
                if matches:
                    method = method_offset + 8 * method_index
                    type_index = struct.unpack_from("<H", data, method)[0]
                    descriptor = strings[uint(type_offset + 4 * type_index)]
                    yield {"class": descriptor, "method": strings[uint(method + 4)], "strings": matches}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("apk")
    parser.add_argument("fragment", nargs="?", default="")
    parser.add_argument("--exact", action="store_true")
    parser.add_argument("--field", nargs=2, metavar=("CLASS", "NAME"))
    parser.add_argument("--method", nargs=2, metavar=("CLASS", "NAME"))
    args = parser.parse_args()
    with zipfile.ZipFile(args.apk) as archive:
        for name in archive.namelist():
            if name.startswith("classes") and name.endswith(".dex") and "/" not in name:
                for match in find_references(archive.read(name), args.fragment, args.exact, args.field, args.method):
                    print(json.dumps({"dex": name, **match}, ensure_ascii=False))
