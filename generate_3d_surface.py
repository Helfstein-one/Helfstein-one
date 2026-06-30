import os
import requests
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from scipy.ndimage import gaussian_filter

# Configurations
USERNAME = "Helfstein-one"
TOKEN = os.environ.get("GITHUB_TOKEN")

# GTA VI Vice City Color Palette
COLORS = ["#2b1b54", "#ff007c", "#ff7b00", "#ffea00", "#00e5ff"]
BACKGROUND_COLOR = "#0d1117"

def fetch_languages():
    if not TOKEN:
        print("No GITHUB_TOKEN found, using mock data")
        return ["Python", "SQL", "HTML", "Jupyter", "Shell"], [50, 30, 15, 10, 5]

    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    query = """
    query($userName:String!) {
      user(login: $userName){
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes {
            languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
    """
    
    variables = {"userName": USERNAME}
    response = requests.post(
        "https://api.github.com/graphql",
        json={"query": query, "variables": variables},
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}")
        return ["Python", "SQL", "HTML", "Jupyter", "Shell"], [50, 30, 15, 10, 5]
        
    data = response.json()
    repos = data['data']['user']['repositories']['nodes']
    
    lang_stats = {}
    for repo in repos:
        for edge in repo['languages']['edges']:
            lang_name = edge['node']['name']
            size = edge['size']
            lang_stats[lang_name] = lang_stats.get(lang_name, 0) + size
            
    if not lang_stats:
        return ["Python", "SQL", "HTML", "Jupyter", "Shell"], [50, 30, 15, 10, 5]
        
    # Sort by size descending and take top 7 languages
    sorted_langs = sorted(lang_stats.items(), key=lambda x: x[1], reverse=True)[:7]
    labels = [x[0] for x in sorted_langs]
    sizes = [x[1] for x in sorted_langs]
    
    # Normalize sizes to avoid massive peaks
    max_size = max(sizes) if sizes else 1
    sizes = [(s / max_size) * 100 for s in sizes]
    
    return labels, sizes

def generate_surface_plot(labels, sizes):
    # Convert 1D data to a 2D surface (simulating depth)
    z_1d = np.array(sizes)
    # Create a 2D matrix where the Y axis is just depth (10 rows)
    matrix = np.tile(z_1d, (10, 1))
    
    # Smooth the surface so it looks like rolling hills instead of sharp blocks
    # We apply a gentle blur to make it a continuous mathematical surface
    smoothed_matrix = gaussian_filter(matrix, sigma=(0.5, 0.8))
    
    # Create meshgrid
    X, Y = np.meshgrid(np.arange(smoothed_matrix.shape[1]), np.arange(smoothed_matrix.shape[0]))
    
    # Setup plot
    fig = plt.figure(figsize=(12, 6), facecolor=BACKGROUND_COLOR)
    ax = fig.add_subplot(111, projection='3d')
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Create GTA VI colormap
    gta_cmap = LinearSegmentedColormap.from_list("gta_vi", COLORS, N=256)
    
    # Plot the surface
    surf = ax.plot_surface(X, Y, smoothed_matrix, 
                           cmap=gta_cmap, 
                           linewidth=0, 
                           antialiased=True,
                           alpha=0.9)
                           
    # Customize axes to match the dark theme while keeping grid lines visible
    ax.xaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
    ax.yaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
    ax.zaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
    
    # Enable and style grid lines (quadrados de referência solicitados pelo usuário)
    ax.grid(True)
    ax.xaxis._axinfo["grid"].update({"color": "#ffffff", "linewidth": 0.3, "alpha": 0.4})
    ax.yaxis._axinfo["grid"].update({"color": "#ffffff", "linewidth": 0.3, "alpha": 0.4})
    ax.zaxis._axinfo["grid"].update({"color": "#ffffff", "linewidth": 0.3, "alpha": 0.4})
    
    # Make axes lines slightly visible
    ax.xaxis.line.set_color((1.0, 1.0, 1.0, 0.3))
    ax.yaxis.line.set_color((1.0, 1.0, 1.0, 0.3))
    ax.zaxis.line.set_color((1.0, 1.0, 1.0, 0.3))
    
    # Configure tick labels for X axis (Technologies)
    ax.set_xticks(np.arange(len(labels)))
    ax.set_xticklabels(labels, color='#00e5ff', fontsize=10, rotation=15)
    
    # Hide Y ticks (Depth is just visual)
    ax.set_yticks([])
    
    # Configure Z ticks (Usage intensity)
    ax.tick_params(axis='z', colors='#8b949e', labelsize=8)
    
    # Add axis labels
    ax.set_xlabel('\nTecnologias', color='#ffea00', fontsize=12, labelpad=20)
    ax.set_zlabel('Intensidade / Uso', color='#ffea00', fontsize=12, labelpad=10)
    
    # Adjust view angle for a nice isometric feel (rotated to put X-axis on the right)
    ax.view_init(elev=25, azim=45)
    
    # Add a cool title
    plt.title("Habilidades & Tecnologias (Superfície 3D)", color="#ff007c", fontdict={'fontsize': 18, 'fontweight': 'bold'}, pad=20)
    
    # Save the figure
    plt.savefig('3d_surface_graph.png', 
                dpi=300, 
                bbox_inches='tight', 
                facecolor=fig.get_facecolor(), 
                edgecolor='none')
    print("Successfully generated 3d_surface_graph.png")

if __name__ == "__main__":
    print("Fetching language data...")
    labels, sizes = fetch_languages()
    print("Generating 3D skills surface plot...")
    generate_surface_plot(labels, sizes)
