import urllib.request, json, subprocess, re

url = subprocess.check_output(['git', 'remote', 'get-url', 'origin']).decode().strip()
m = re.search(r'https://[^:]+:([^@]+)@', url)
token = m.group(1) if m else ''
req = urllib.request.Request('https://api.github.com/repos/velqor1/Mod-Yandex-Music/releases', headers={
    'Authorization': f'token {token}',
    'User-Agent': 'ModYandex'
})
try:
    with urllib.request.urlopen(req) as resp:
        rels = json.loads(resp.read().decode())
        for r in rels:
            print(f"{r['tag_name']}: {r['name']} (id={r['id']})")
except Exception as e:
    print('Error:', e)
