import xml.etree.ElementTree as ET
import base64
import sys

def inject_surface():
    svg_path = 'profile-3d-contrib/profile-night-rainbow.svg'
    png_path = '3d_surface_graph.png'
    
    print(f"Injecting {png_path} into {svg_path}...")
    
    try:
        ET.register_namespace('', "http://www.w3.org/2000/svg")
        tree = ET.parse(svg_path)
        root = tree.getroot()
        
        # The donut chart is typically at index 4 (Child 4)
        # We can also search for it, but index 4 is stable in this plugin
        # Let's find the group that is translated to (40, 520) which is the donut chart
        donut_group = None
        for child in root:
            if child.tag.endswith('g') and child.attrib.get('transform') == 'translate(40, 520)':
                donut_group = child
                break
                
        if donut_group is not None:
            root.remove(donut_group)
        else:
            # Fallback to index 4 if exact match fails
            if len(root) > 4:
                root.remove(root[4])
        
        # Read the 3D surface graph as base64
        with open(png_path, 'rb') as f:
            img_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Create a new group to hold our image at roughly the same position
        # We shift it a bit to align perfectly
        new_g = ET.Element('{http://www.w3.org/2000/svg}g', {'transform': 'translate(-30, 480)'})
        
        # The original donut chart was roughly 300x300. Our surface is 1200x600, so we scale it down to width 600.
        image = ET.Element('{http://www.w3.org/2000/svg}image', {
            'href': f'data:image/png;base64,{img_data}',
            'width': '500',
            'height': '250'
        })
        new_g.append(image)
        
        # Insert back at index 4
        root.insert(4, new_g)
        
        # Write the modified SVG
        tree.write(svg_path)
        print("Successfully injected custom 3D surface into the plugin dashboard!")
        
    except Exception as e:
        print(f"Error during injection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    inject_surface()
