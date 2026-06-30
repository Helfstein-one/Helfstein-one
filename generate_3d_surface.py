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

def fetch_contributions():
    if not TOKEN:
        # Fallback to random data if running locally without token
        print("No GITHUB_TOKEN found, using mock data")
        return np.random.randint(0, 10, size=(7, 52))

    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    
    query = """
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
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
        return np.random.randint(0, 10, size=(7, 52))
        
    data = response.json()
    weeks = data['data']['user']['contributionsCollection']['contributionCalendar']['weeks']
    
    matrix = np.zeros((7, 52))
    
    for w, week in enumerate(weeks[-52:]): # Take last 52 weeks
        for day in week['contributionDays']:
            # weekday mapping: 0 = Sunday, 6 = Saturday
            weekday = day.get('weekday', 0)
            # Some versions of API don't return weekday directly, might need to infer
            # The order in the array is usually Sun -> Sat
            matrix[day.get('weekday', week['contributionDays'].index(day)), w] = day['contributionCount']
            
    return matrix

def generate_surface_plot(matrix):
    # Smooth the data to create a continuous surface rather than sharp blocks
    # sigma controls the smoothness
    smoothed_matrix = gaussian_filter(matrix, sigma=1.5)
    
    # Scale up for better visualization if values are low
    smoothed_matrix = smoothed_matrix * 10
    
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
                           
    # Customize axes to match the dark theme and hide the messy labels
    ax.xaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
    ax.yaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
    ax.zaxis.set_pane_color((0.0, 0.0, 0.0, 0.0))
    
    # Hide grid lines
    ax.grid(False)
    
    # Make axes transparent
    ax.xaxis.line.set_color((1.0, 1.0, 1.0, 0.0))
    ax.yaxis.line.set_color((1.0, 1.0, 1.0, 0.0))
    ax.zaxis.line.set_color((1.0, 1.0, 1.0, 0.0))
    
    # Remove ticks
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_zticks([])
    
    # Adjust view angle for a nice isometric feel
    ax.view_init(elev=35, azim=-45)
    
    # Add a cool title
    plt.title("GitHub Contributions Surface", color="#ff007c", fontdict={'fontsize': 18, 'fontweight': 'bold'}, pad=20)
    
    # Save the figure
    plt.savefig('3d_surface_graph.png', 
                dpi=300, 
                bbox_inches='tight', 
                facecolor=fig.get_facecolor(), 
                edgecolor='none')
    print("Successfully generated 3d_surface_graph.png")

if __name__ == "__main__":
    print("Fetching data...")
    data_matrix = fetch_contributions()
    print("Generating 3D surface plot...")
    generate_surface_plot(data_matrix)
