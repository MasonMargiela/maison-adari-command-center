import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Fix Tile component signature to make children optional
content = content.replace(
    'const Tile = ({ label, value, sub, color, children }) =>',
    'const Tile = ({ label, value, sub, color, children }: { label: any; value?: any; sub?: any; color: any; children?: any }) =>'
)

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("Done")
