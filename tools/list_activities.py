import re

with open(r'C:/Users/denbi/.gemini/antigravity/brain/d3882c7f-ab57-4618-b3e9-b25f1a518aaf/.system_generated/steps/1004/output.txt', 'r', encoding='utf-8') as f:
    text = f.read()

activities = re.findall(r'E: (?:activity|activity-alias) \(line=\d+\).*?android:name\([^\)]+\)=\"([^\"]+)\"', text, re.DOTALL)
for a in sorted(set(activities)):
    print(a)
