import urllib.request, json, subprocess, re

url = subprocess.check_output(['git', 'remote', 'get-url', 'origin']).decode().strip()
m = re.search(r'https://[^:]+:([^@]+)@', url)
token = m.group(1) if m else ''
req = urllib.request.Request('https://api.github.com/repos/velqor1/Mod-Yandex-Music/releases', headers={
    'Authorization': f'token {token}',
    'User-Agent': 'ModYandex'
})
with urllib.request.urlopen(req) as resp:
    rels = json.loads(resp.read().decode())
    for r in rels:
        print(f"Tag: {r['tag_name']}")
        for a in r.get('assets', []):
            print(f"  Asset: {a['name']} ({a['size'] / (1024*1024):.1f} MB) -> {a['browser_download_url']}")
