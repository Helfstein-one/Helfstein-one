import os
import requests
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Configurations
USERNAME = "Helfstein-one"
TOKEN = os.environ.get("GITHUB_TOKEN")

# GTA VI Vice City Color Palette
COLORS = ["#ff007c", "#ff7b00", "#ffea00", "#00e5ff", "#2b1b54", "#8a2be2", "#39ff14"]
BACKGROUND_COLOR = "#0d1117"

def fetch_languages():
    if not TOKEN:
        print("No GITHUB_TOKEN found, using mock data")
        return ["Python", "SQL", "AWS", "Airflow", "HTML"], [50, 30, 20, 15, 10]

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
        return ["Python", "SQL", "AWS", "Airflow", "HTML"], [50, 30, 20, 15, 10]
        
    data = response.json()
    repos = data['data']['user']['repositories']['nodes']
    
    lang_stats = {}
    for repo in repos:
        for edge in repo['languages']['edges']:
            lang_name = edge['node']['name']
            size = edge['size']
            lang_stats[lang_name] = lang_stats.get(lang_name, 0) + size
            
    if not lang_stats:
        return ["Python", "SQL", "AWS", "Airflow", "HTML"], [50, 30, 20, 15, 10]
        
    # Sort by size descending and take top 5-7 languages
    sorted_langs = sorted(lang_stats.items(), key=lambda x: x[1], reverse=True)[:6]
    labels = [x[0] for x in sorted_langs]
    sizes = [x[1] for x in sorted_langs]
    
    return labels, sizes

def generate_3d_pie(labels, sizes):
    fig = plt.figure(figsize=(10, 8), facecolor=BACKGROUND_COLOR)
    ax = fig.add_subplot(111, projection='3d')
    ax.set_facecolor(BACKGROUND_COLOR)

    # Disable axes
    ax.axis('off')

    total = sum(sizes)
    angles = [s/total * 2 * np.pi for s in sizes]
    starts = [sum(angles[:i]) for i in range(len(angles))]

    # Max height corresponds to highest size
    max_height = 0.8
    # Normalize heights so the smallest is noticeable but the largest is max_height
    min_height = 0.2
    normalized_sizes = [s/max(sizes) for s in sizes]
    heights = [ns * max_height + min_height for ns in normalized_sizes]

    # Plot each slice
    for start, angle, color, height, label in zip(starts, angles, COLORS, heights, labels):
        x = np.linspace(start, start+angle, 50)
        r = np.linspace(0, 1, 2)
        R, Theta = np.meshgrid(r, x)
        X = R * np.cos(Theta)
        Y = R * np.sin(Theta)
        Z = np.ones_like(X) * height
        
        # Top surface
        ax.plot_surface(X, Y, Z, color=color, alpha=0.95, shade=True)
        # Bottom surface
        ax.plot_surface(X, Y, np.zeros_like(X), color=color, alpha=0.95, shade=True)
        
        # Outer curved side
        Theta_side, Z_side = np.meshgrid(x, np.linspace(0, height, 2))
        X_side = np.cos(Theta_side)
        Y_side = np.sin(Theta_side)
        ax.plot_surface(X_side, Y_side, Z_side, color=color, alpha=0.8, shade=True)
        
        # Flat walls (the straight slices)
        # Left wall
        r_wall = np.linspace(0, 1, 2)
        z_wall = np.linspace(0, height, 2)
        R_wall, Z_wall = np.meshgrid(r_wall, z_wall)
        X_wall = R_wall * np.cos(start)
        Y_wall = R_wall * np.sin(start)
        ax.plot_surface(X_wall, Y_wall, Z_wall, color=color, alpha=0.6, shade=True)
        
        # Right wall
        X_wall_end = R_wall * np.cos(start+angle)
        Y_wall_end = R_wall * np.sin(start+angle)
        ax.plot_surface(X_wall_end, Y_wall_end, Z_wall, color=color, alpha=0.6, shade=True)

        # Label positioning
        mid_angle = start + angle/2
        label_x = 1.4 * np.cos(mid_angle)
        label_y = 1.4 * np.sin(mid_angle)
        # Add text labels with a nice neon glow effect (using text shadow)
        ax.text(label_x, label_y, height/2, label, color='#eeeeff', fontsize=14, fontweight='bold', ha='center', va='center')

    ax.set_zlim(0, 1.2)
    # Nice isometric angle
    ax.view_init(elev=35, azim=-45)
    
    plt.title("Linguagens & Tecnologias", color="#ff007c", fontdict={'fontsize': 20, 'fontweight': 'bold'}, pad=10)
    
    plt.tight_layout()
    plt.savefig('3d_pie_graph.png', 
                dpi=300, 
                bbox_inches='tight', 
                facecolor=fig.get_facecolor(), 
                edgecolor='none')
    print("Successfully generated 3d_pie_graph.png")

if __name__ == "__main__":
    print("Fetching language data...")
    labels, sizes = fetch_languages()
    print("Generating 3D tiered pie chart...")
    generate_3d_pie(labels, sizes)
