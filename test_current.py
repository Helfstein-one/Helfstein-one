import xml.etree.ElementTree as ET
tree = ET.parse('profile-3d-contrib/profile-night-rainbow.svg')
root = tree.getroot()
for i, child in enumerate(root):
    print(f"Child {i}: tag={child.tag}, attrib={child.attrib}")
