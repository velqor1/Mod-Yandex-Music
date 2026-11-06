# Check OldLoginActivity
with open('tools/decompiled/smali_classes2/ru/yandex/music/auth/login/OldLoginActivity.smali', 'r', encoding='utf-8') as f:
    c = f.read()
    print("OldLoginActivity LUz1 present:", "LUz1;->try" in c)
    print("OldLoginActivity autologin override present:", "const/4 v0, 0x0" in c)

# Check uD6
with open('tools/decompiled/smali_classes2/uD6.smali', 'r', encoding='utf-8') as f:
    c = f.read()
    print("uD6 autologin override present:", "const/4 v4, 0x0" in c)

# Check rw5$b
with open('tools/decompiled/smali_classes4/rw5$b.smali', 'r', encoding='utf-8') as f:
    c = f.read()
    print("rw5$b p1 override present:", ":goto_0\n    const/4 p1, 0x0" in c)
