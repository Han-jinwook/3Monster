import io

with io.open(r'd:\3Monster\admin-dashboard\src\pages\Showroom.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("디럭스 5일", "디럭스 1개월")

with io.open(r'd:\3Monster\admin-dashboard\src\pages\Showroom.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
