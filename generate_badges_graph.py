import matplotlib.pyplot as plt
import networkx as nx
import numpy as np

BACKGROUND_COLOR = "#0d1117"
NEON_COLORS = ["#ff007c", "#ff7b00", "#ffea00", "#00e5ff", "#8a2be2"]

def create_badges_graph():
    G = nx.Graph()
    
    # Add nodes
    G.add_node("Data Engineer", layer=0, size=3000, color="#ff007c")
    
    # Level 1 nodes (Categories)
    categories = {"Cloud": "#00e5ff", "Data Science": "#ffea00", "Analytics": "#8a2be2"}
    for cat, color in categories.items():
        G.add_node(cat, layer=1, size=2000, color=color)
        G.add_edge("Data Engineer", cat)
        
    # Level 2 nodes (Badges)
    badges = {
        "AWS Cloud\nPractitioner": "Cloud",
        "Azure Data\nFundamentals": "Cloud",
        "DataCamp\nCertified": "Data Science",
        "IBM Advocate\nV2": "Analytics",
        "Python / SQL": "Data Science",
        "Apache Spark": "Data Science",
        "Docker / Airflow": "Cloud"
    }
    
    for badge, parent in badges.items():
        # Match color to parent
        color = categories[parent]
        G.add_node(badge, layer=2, size=1500, color=color)
        G.add_edge(parent, badge)

    # Use a spring layout but customized
    pos = nx.spring_layout(G, seed=42, k=0.9, iterations=50)
    
    # Adjust position for a bit more hierarchical look manually if needed, 
    # but spring layout usually looks organic and nice.

    fig, ax = plt.subplots(figsize=(12, 8), facecolor=BACKGROUND_COLOR)
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Draw edges with glow effect
    for u, v in G.edges():
        x = [pos[u][0], pos[v][0]]
        y = [pos[u][1], pos[v][1]]
        
        # Base line
        ax.plot(x, y, color="#ffffff", alpha=0.3, linewidth=2, zorder=1)
        # Glow
        ax.plot(x, y, color=G.nodes[v]['color'], alpha=0.1, linewidth=8, zorder=1)

    # Draw nodes
    for node in G.nodes():
        x, y = pos[node]
        color = G.nodes[node]['color']
        size = G.nodes[node]['size']
        
        # Node glow
        ax.scatter(x, y, s=size*1.5, color=color, alpha=0.2, zorder=2)
        # Node core
        ax.scatter(x, y, s=size, color=BACKGROUND_COLOR, edgecolors=color, linewidths=3, zorder=3)
        
        # Labels
        # Central node slightly larger text
        fontsize = 14 if G.nodes[node].get('layer') == 0 else 10
        fontweight = 'bold' if G.nodes[node].get('layer') <= 1 else 'normal'
        ax.text(x, y, node, color="#eeeeff", fontsize=fontsize, fontweight=fontweight, 
                ha='center', va='center', zorder=4)

    plt.title("Constelação de Credenciais & Skills", color="#ff007c", fontsize=20, fontweight='bold', pad=20)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('badges_graph.png', dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    print("Graph generated: badges_graph.png")

if __name__ == "__main__":
    create_badges_graph()
