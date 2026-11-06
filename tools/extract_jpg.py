import struct

pkg_path = r'C:\Program Files (x86)\Steam\steamapps\workshop\content\431960\1629845246\scene.pkg'
with open(pkg_path, 'rb') as f:
    magic_len = struct.unpack('<I', f.read(4))[0]
    magic = f.read(magic_len).decode('ascii')
    file_count = struct.unpack('<I', f.read(4))[0]
    
    entries = []
    for i in range(file_count):
        name_len = struct.unpack('<I', f.read(4))[0]
        name = f.read(name_len).decode('utf-8', errors='ignore')
        offset = struct.unpack('<I', f.read(4))[0]
        size = struct.unpack('<I', f.read(4))[0]
        entries.append((name, offset, size))
        
    data_start = f.tell()
    for name, offset, size in entries:
        if name.endswith('.tex') and size > 100000:
            f.seek(data_start + offset)
            tex_data = f.read(size)
            jpg_idx = tex_data.find(b'\xff\xd8\xff')
            if jpg_idx != -1:
                jpg_data = tex_data[jpg_idx:]
                with open('tools/test_extracted.jpg', 'wb') as out:
                    out.write(jpg_data)
                print('Extracted JPEG size:', len(jpg_data))
            break
