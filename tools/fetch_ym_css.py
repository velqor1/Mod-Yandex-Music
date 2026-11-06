import urllib.request, re

url = 'https://music.yandex.ru'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    links = re.findall(r'<link[^>]*href="([^"]+\.css[^"]*)"', html)
    print(f"Found {len(links)} css links:")
    for l in links:
        print("  LINK:", l)
        # Fetch first css link
        css_url = l if l.startswith('http') else 'https://music.yandex.ru' + l
        try:
            css_data = urllib.request.urlopen(urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8', errors='ignore')
            print(f"  Fetched {len(css_data)} bytes from {l}")
            for m in re.findall(r'([^{}]+)\{([^{}]+)\}', css_data):
                sel, rules = m
                if any(k in sel for k in ['CommonLayout_root', 'bigCardPanelBackground', 'Content_main', 'DefaultLayout_rootNewVibe', 'NavbarDesktop_root']):
                    if 'background' in rules or 'z-index' in rules:
                        print("  MATCH SEL:", sel.strip())
                        print("  MATCH RULES:", rules.strip())
                        print("  ===")
        except Exception as err:
            print("  Fetch error:", err)
except Exception as e:
    print("Error:", e)
