import xml.etree.ElementTree as ET

ET.register_namespace('', "http://www.w3.org/2000/svg")
tree = ET.parse('profile-3d-contrib/profile-night-rainbow.svg')
root = tree.getroot()

donut_group = None
for child in root:
    print("Found child with tag:", child.tag, "attrib:", child.attrib)
    if child.tag.endswith('g') and child.attrib.get('transform') == 'translate(40, 520)':
        donut_group = child
        break

if donut_group is not None:
    print("Found donut group! Removing...")
    root.remove(donut_group)
else:
    print("Donut group NOT found!")

tree.write('test_removed.svg')
