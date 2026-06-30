import xml.etree.ElementTree as ET
import base64
import sys

def inject_pie():
    svg_path = 'profile-3d-contrib/profile-night-rainbow.svg'
    png_path = '3d_pie_graph.png'
    
    print(f"Injecting {png_path} into {svg_path}...")
    
    try:
        ET.register_namespace('', "http://www.w3.org/2000/svg")
        tree = ET.parse(svg_path)
        root = tree.getroot()
        
        # Remove the donut chart
        to_remove = []
        for child in root:
            if child.tag.endswith('g'):
                transform = child.attrib.get('transform', '')
                if 'translate(40' in transform and '520)' in transform:
                    to_remove.append(child)
                # Also check if it's our previously injected image
                if 'translate(10' in transform and '480)' in transform:
                    to_remove.append(child)
                    
        for child in to_remove:
            root.remove(child)
            
        # Read the 3D pie graph as base64
        with open(png_path, 'rb') as f:
            img_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Create a new group to hold our image at roughly the same position
        new_g = ET.Element('{http://www.w3.org/2000/svg}g', {'transform': 'translate(10, 480)'})
        
        image = ET.Element('{http://www.w3.org/2000/svg}image', {
            'href': f'data:image/png;base64,{img_data}',
            'width': '380',
            'height': '320'
        })
        new_g.append(image)
        
        # Insert back near the end
        root.insert(len(root)-1, new_g)
        
        # Write the modified SVG
        tree.write(svg_path)
        print("Successfully injected 3D pie chart into the plugin dashboard!")
        
    except Exception as e:
        print(f"Error during injection: {e}")
        sys.exit(1)

if __name__ == "__main__":
    inject_pie()
