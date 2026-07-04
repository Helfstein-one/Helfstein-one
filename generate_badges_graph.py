import matplotlib.pyplot as plt
import networkx as nx
import requests
from io import BytesIO
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
import numpy as np

BACKGROUND_COLOR = "#0d1117"

def get_image(url):
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        img = plt.imread(BytesIO(response.content), format='png')
        return img
    except Exception as e:
        print(f"Error loading image from {url}: {e}")
        return None

def create_badges_graph():
    G = nx.Graph()
    
    # Central Node
    G.add_node("Data Engineer", layer=0, size=3000, color="#ff007c", img=None)
    
    categories = {"Cloud": "#00e5ff", "Data Science": "#ffea00", "Analytics": "#8a2be2"}
    for cat, color in categories.items():
        G.add_node(cat, layer=1, size=2000, color=color, img=None)
        G.add_edge("Data Engineer", cat)
        
    badges = {
        "AWS Cloud\nPractitioner": ("Cloud", "http://aws.amazon.com"),
        "Azure Data\nFundamentals": ("Cloud", "http://azure.microsoft.com"),
        "DataCamp\nCertified": ("Data Science", "http://datacamp.com"),
        "IBM Advocate\nV2": ("Analytics", "http://ibm.com"),
        "Python / SQL": ("Data Science", "http://python.org"),
        "Apache Spark": ("Data Science", "http://spark.apache.org"),
        "Docker / Airflow": ("Cloud", "http://airflow.apache.org")
    }
    
    for badge, (parent, url) in badges.items():
        favicon_url = f"https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url={url}&size=128"
        color = categories[parent]
        G.add_node(badge, layer=2, size=1500, color=color, img_url=favicon_url)
        G.add_edge(parent, badge)

    pos = nx.spring_layout(G, seed=42, k=0.9, iterations=50)
    
    fig, ax = plt.subplots(figsize=(12, 8), facecolor=BACKGROUND_COLOR)
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Edges
    for u, v in G.edges():
        x = [pos[u][0], pos[v][0]]
        y = [pos[u][1], pos[v][1]]
        ax.plot(x, y, color="#ffffff", alpha=0.3, linewidth=2, zorder=1)
        ax.plot(x, y, color=G.nodes[v]['color'], alpha=0.1, linewidth=8, zorder=1)

    # Nodes
    for node in G.nodes():
        x, y = pos[node]
        color = G.nodes[node]['color']
        
        # Node glow
        ax.scatter(x, y, s=G.nodes[node]['size']*1.5, color=color, alpha=0.2, zorder=2)
        
        img_url = G.nodes[node].get('img_url')
        if img_url:
            img = get_image(img_url)
            if img is not None:
                # Draw the background circle
                ax.scatter(x, y, s=G.nodes[node]['size'], color=BACKGROUND_COLOR, edgecolors=color, linewidths=3, zorder=3)
                # Draw the image on top
                imagebox = OffsetImage(img, zoom=0.3)
                ab = AnnotationBbox(imagebox, (x, y), frameon=False, zorder=10)
                ax.add_artist(ab)
                # Label below the image
                ax.text(x, y - 0.08, node, color="#eeeeff", fontsize=10, ha='center', va='top', zorder=11)
            else:
                ax.scatter(x, y, s=G.nodes[node]['size'], color=BACKGROUND_COLOR, edgecolors=color, linewidths=3, zorder=3)
                ax.text(x, y, node, color="#eeeeff", fontsize=10, ha='center', va='center', zorder=11)
        else:
            # Draw standard node
            ax.scatter(x, y, s=G.nodes[node]['size'], color=BACKGROUND_COLOR, edgecolors=color, linewidths=3, zorder=3)
            fontsize = 14 if G.nodes[node].get('layer') == 0 else 11
            fontweight = 'bold'
            ax.text(x, y, node, color="#eeeeff", fontsize=fontsize, fontweight=fontweight, ha='center', va='center', zorder=11)

    plt.title("Constelação de Credenciais & Skills", color="#ff007c", fontsize=20, fontweight='bold', pad=20)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('badges_graph.png', dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print("Graph generated: badges_graph.png")

if __name__ == "__main__":
    create_badges_graph()
