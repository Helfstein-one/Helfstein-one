#!/usr/bin/env python3
"""
Generate Soviet Space Shuttle Buran (Буран) Anatomy Blueprint
Theme: GTA VI / Vice City Neon on GitHub Dark (#0d1117)
"""

import os

SVG_WIDTH = 1000
SVG_HEIGHT = 650

BG_COLOR = "#0d1117"
CYAN = "#00e5ff"
PINK = "#ff007c"
ORANGE = "#ff7b00"
YELLOW = "#ffea00"
PURPLE = "#2b1b54"
GRID_COLOR = "rgba(0, 229, 255, 0.08)"
TEXT_MUTED = "#8b949e"

def generate_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}" width="100%" height="auto" style="background-color: {BG_COLOR}; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;">
  <defs>
    <!-- Blueprint Grids -->
    <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="{GRID_COLOR}" stroke-width="0.8"/>
    </pattern>
    <pattern id="major-grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="{GRID_COLOR}" stroke-width="1.8"/>
    </pattern>

    <!-- Glow Filters -->
    <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="glow-pink" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Gradients -->
    <linearGradient id="shuttle-hull" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1b212b" />
      <stop offset="50%" stop-color="#141922" />
      <stop offset="100%" stop-color="#0e131a" />
    </linearGradient>

    <linearGradient id="rocket-flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{YELLOW}" stop-opacity="0.9" />
      <stop offset="40%" stop-color="{ORANGE}" stop-opacity="0.75" />
      <stop offset="100%" stop-color="{PINK}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Background Grids -->
  <rect width="100%" height="100%" fill="{BG_COLOR}"/>
  <rect width="100%" height="100%" fill="url(#blueprint-grid)"/>
  <rect width="100%" height="100%" fill="url(#major-grid)"/>

  <!-- Technical Framing Border -->
  <rect x="15" y="15" width="{SVG_WIDTH - 30}" height="{SVG_HEIGHT - 30}" fill="none" stroke="{CYAN}" stroke-opacity="0.25" stroke-width="1.2"/>
  <rect x="20" y="20" width="{SVG_WIDTH - 40}" height="{SVG_HEIGHT - 40}" fill="none" stroke="{CYAN}" stroke-opacity="0.12" stroke-dasharray="8 4" stroke-width="1"/>

  <!-- Precision Corner Brackets -->
  <path d="M 12 32 L 12 12 L 32 12" fill="none" stroke="{PINK}" stroke-width="2.5" />
  <path d="M {SVG_WIDTH-12} 32 L {SVG_WIDTH-12} 12 L {SVG_WIDTH-32} 12" fill="none" stroke="{PINK}" stroke-width="2.5" />
  <path d="M 12 {SVG_HEIGHT-32} L 12 {SVG_HEIGHT-12} L 32 {SVG_HEIGHT-12}" fill="none" stroke="{PINK}" stroke-width="2.5" />
  <path d="M {SVG_WIDTH-12} {SVG_HEIGHT-32} L {SVG_WIDTH-12} {SVG_HEIGHT-12} L {SVG_WIDTH-32} {SVG_HEIGHT-12}" fill="none" stroke="{PINK}" stroke-width="2.5" />

  <!-- Top Header Title -->
  <g transform="translate(40, 48)">
    <text x="0" y="0" font-size="11" fill="{CYAN}" letter-spacing="3" font-weight="700">TECHNICAL SYSTEM SPECIFICATION // OK-1K1 [11F35]</text>
    <text x="0" y="25" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="2">SOVIET BURAN <tspan fill="{PINK}">•</tspan> SKILL ANATOMY</text>
    <text x="0" y="42" font-size="11" fill="{YELLOW}" letter-spacing="1.5">ОРБИТАЛЬНЫЙ КОРАБЛЬ «БУРАН» // HELFSTEIN DATA PLATFORM</text>
  </g>

  <!-- Status Badge (Top Right) -->
  <g transform="translate({SVG_WIDTH - 250}, 38)">
    <rect width="210" height="46" rx="6" fill="#161b22" stroke="{CYAN}" stroke-opacity="0.4" stroke-width="1"/>
    <circle cx="18" cy="18" r="4.5" fill="{PINK}" filter="url(#glow-pink)"/>
    <text x="32" y="21" font-size="10.5" fill="#ffffff" font-weight="bold" letter-spacing="0.5">AUTONOMOUS ORBITAL</text>
    <text x="32" y="35" font-size="9" fill="{TEXT_MUTED}" letter-spacing="0.5">FLIGHT READY // 15.11.1988</text>
  </g>

  <!-- ==================== BURAN ORBITER WIREFRAME ==================== -->
  <g id="buran-geometry" transform="translate(500, 100)">
    
    <!-- Cryogenic Thrust Plumes -->
    <path d="M -16 385 Q 0 465 16 385 Z" fill="url(#rocket-flame)" filter="url(#glow-pink)"/>
    <path d="M -44 380 Q -34 430 -24 380 Z" fill="url(#rocket-flame)"/>
    <path d="M 24 380 Q 34 430 44 380 Z" fill="url(#rocket-flame)"/>

    <!-- Wing & Fuselage Double-Delta Silhouette -->
    <path d="M 0 30 
             C 12 30, 26 50, 32 90
             L 36 175
             L 165 315
             C 174 324, 172 342, 166 352
             L 154 355
             L 48 358
             L 48 382
             L -48 382
             L -48 358
             L -154 355
             C -166 342, -174 324, -165 315
             L -36 175
             L -32 90
             C -26 50, -12 30, 0 30 Z" 
          fill="url(#shuttle-hull)" 
          stroke="{CYAN}" 
          stroke-width="1.8"
          filter="url(#glow-cyan)"/>

    <!-- Wing Thermal Protection Tiles (Carbon-Carbon Leading Edge Accent) -->
    <path d="M -152 342 L -50 342 M -125 322 L -45 322 M -98 292 L -40 292 M -68 252 L -36 252" 
          stroke="{PINK}" stroke-opacity="0.35" stroke-dasharray="3 3" stroke-width="1"/>
    <path d="M 152 342 L 50 342 M 125 322 L 45 322 M 98 292 L 40 292 M 68 252 L 36 252" 
          stroke="{PINK}" stroke-opacity="0.35" stroke-dasharray="3 3" stroke-width="1"/>

    <!-- Center Fuselage Body -->
    <rect x="-34" y="85" width="68" height="272" rx="10" fill="#161b22" stroke="{CYAN}" stroke-width="1.3"/>

    <!-- Payload Cargo Bay Segmented Doors -->
    <line x1="0" y1="95" x2="0" y2="300" stroke="{PINK}" stroke-width="1.6" stroke-dasharray="5 3"/>
    <rect x="-28" y="102" width="56" height="192" fill="none" stroke="{CYAN}" stroke-opacity="0.35" stroke-width="1"/>
    <line x1="-28" y1="165" x2="28" y2="165" stroke="{CYAN}" stroke-opacity="0.3" stroke-width="1"/>
    <line x1="-28" y1="230" x2="28" y2="230" stroke="{CYAN}" stroke-opacity="0.3" stroke-width="1"/>

    <!-- Nose Cone Cap (Reinforced Carbon-Carbon) -->
    <path d="M 0 30 C 13 30, 22 52, 22 72 L -22 72 C -22 52, -13 30, 0 30 Z" fill="#0d1117" stroke="{PINK}" stroke-width="1.6"/>
    
    <!-- Cockpit Flight Windows -->
    <polygon points="-11,66 -4,63 -4,70 -12,71" fill="{YELLOW}" filter="url(#glow-cyan)"/>
    <polygon points="11,66 4,63 4,70 12,71" fill="{YELLOW}" filter="url(#glow-cyan)"/>
    <polygon points="-3,62 0,61 3,62 3,69 -3,69" fill="{YELLOW}"/>

    <!-- Vertical Stabilizer Tail Fin (Vertical Fin with split rudder) -->
    <path d="M -5 270 L 5 270 L 4 372 L -4 372 Z" fill="#21262d" stroke="{PINK}" stroke-width="1.4"/>
    <line x1="0" y1="270" x2="0" y2="372" stroke="{YELLOW}" stroke-width="1.2"/>

    <!-- OMS Pods (Orbiter Maneuvering System / ДРО) -->
    <rect x="-42" y="332" width="16" height="38" rx="4" fill="#0d1117" stroke="{CYAN}" stroke-width="1.2"/>
    <rect x="26" y="332" width="16" height="38" rx="4" fill="#0d1117" stroke="{CYAN}" stroke-width="1.2"/>
    <circle cx="-34" cy="366" r="3" fill="{ORANGE}"/>
    <circle cx="34" cy="366" r="3" fill="{ORANGE}"/>

    <!-- Base Cryogenic RD-0120 Engine Mounts -->
    <circle cx="-16" cy="380" r="7" fill="#161b22" stroke="{PINK}" stroke-width="1.5"/>
    <circle cx="16" cy="380" r="7" fill="#161b22" stroke="{PINK}" stroke-width="1.5"/>
    <circle cx="0" cy="362" r="7" fill="#161b22" stroke="{PINK}" stroke-width="1.5"/>

    <!-- Soviet Red-Star Cyrillic Decals -->
    <text x="72" y="322" font-size="10" fill="{PINK}" font-weight="900" letter-spacing="2">БУРАН</text>
    <text x="-114" y="322" font-size="10" fill="{PINK}" font-weight="900" letter-spacing="3">СССР</text>

    <!-- Center Navigation Target Crosshair -->
    <circle cx="0" cy="215" r="9" fill="none" stroke="{CYAN}" stroke-width="0.8" stroke-dasharray="2 2"/>
    <line x1="0" y1="200" x2="0" y2="230" stroke="{CYAN}" stroke-width="0.8"/>
    <line x1="-15" y1="215" x2="15" y2="215" stroke="{CYAN}" stroke-width="0.8"/>
  </g>

  <!-- ==================== LEADER LINES (ABSOLUTE COORDINATES) ==================== -->
  <g id="leader-lines">
    <!-- 01 Cabin Avionics: from (295, 156) -> (450, 156) -> (500, 168) -->
    <polyline points="295,156 460,156 498,168" fill="none" stroke="{CYAN}" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="498" cy="168" r="4" fill="{CYAN}" filter="url(#glow-cyan)"/>

    <!-- 02 Thermal Shield: from (295, 316) -> (340, 316) -> (380, 410) -->
    <polyline points="295,316 345,316 380,410" fill="none" stroke="{PINK}" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="380" cy="410" r="4" fill="{PINK}" filter="url(#glow-pink)"/>

    <!-- 03 OMS Thrusters: from (295, 476) -> (425, 476) -> (466, 466) -->
    <polyline points="295,476 425,476 466,466" fill="none" stroke="{ORANGE}" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="466" cy="466" r="4" fill="{ORANGE}"/>

    <!-- 04 Payload Bay: from (705, 156) -> (560, 156) -> (518, 250) -->
    <polyline points="705,156 565,156 518,250" fill="none" stroke="{YELLOW}" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="518" cy="250" r="4" fill="{YELLOW}" filter="url(#glow-cyan)"/>

    <!-- 05 Energia Boosters: from (705, 316) -> (600, 316) -> (516, 480) -->
    <polyline points="705,316 600,316 516,480" fill="none" stroke="{PINK}" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="516" cy="480" r="4" fill="{PINK}" filter="url(#glow-pink)"/>

    <!-- 06 Telemetry Stabilizer: from (705, 476) -> (565, 476) -> (505, 410) -->
    <polyline points="705,476 565,476 505,410" fill="none" stroke="{CYAN}" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="505" cy="410" r="4" fill="{CYAN}" filter="url(#glow-cyan)"/>
  </g>

  <!-- ==================== CALLOUT CARDS ==================== -->

  <!-- CARD 01: CABIN & AVIONICS -->
  <g transform="translate(35, 120)">
    <rect width="260" height="74" rx="6" fill="#161b22" stroke="{CYAN}" stroke-width="1.4"/>
    <rect x="0" y="0" width="4" height="74" rx="2" fill="{CYAN}"/>
    <text x="14" y="20" font-size="10.5" font-weight="bold" fill="{CYAN}">01 // CABIN &amp; AVIONICS (БИСВ)</text>
    <text x="14" y="37" font-size="12" font-weight="900" fill="#ffffff">Autonomous Core &amp; Logic</text>
    <text x="14" y="52" font-size="10" fill="{YELLOW}">• Python 3.12 • LangGraph • Agent Loops</text>
    <text x="14" y="65" font-size="9" fill="{TEXT_MUTED}">100% unmanned landing autopilot system</text>
  </g>

  <!-- CARD 02: THERMAL SHIELD -->
  <g transform="translate(35, 280)">
    <rect width="260" height="74" rx="6" fill="#161b22" stroke="{PINK}" stroke-width="1.4"/>
    <rect x="0" y="0" width="4" height="74" rx="2" fill="{PINK}"/>
    <text x="14" y="20" font-size="10.5" font-weight="bold" fill="{PINK}">02 // THERMAL SHIELD (ТЗП)</text>
    <text x="14" y="37" font-size="12" font-weight="900" fill="#ffffff">Governance, IAM &amp; Quality</text>
    <text x="14" y="52" font-size="10" fill="{YELLOW}">• Unity Catalog • Great Expectations</text>
    <text x="14" y="65" font-size="9" fill="{TEXT_MUTED}">38k quartz tiles high-heat protection</text>
  </g>

  <!-- CARD 03: OMS THRUSTERS -->
  <g transform="translate(35, 440)">
    <rect width="260" height="74" rx="6" fill="#161b22" stroke="{ORANGE}" stroke-width="1.4"/>
    <rect x="0" y="0" width="4" height="74" rx="2" fill="{ORANGE}"/>
    <text x="14" y="20" font-size="10.5" font-weight="bold" fill="{ORANGE}">03 // OMS THRUSTERS (ДPO)</text>
    <text x="14" y="37" font-size="12" font-weight="900" fill="#ffffff">Orchestration &amp; Real-Time</text>
    <text x="14" y="52" font-size="10" fill="{YELLOW}">• Apache Airflow • Kafka • Streaming</text>
    <text x="14" y="65" font-size="9" fill="{TEXT_MUTED}">Reactive orbital course triggers</text>
  </g>

  <!-- CARD 04: PAYLOAD BAY -->
  <g transform="translate(705, 120)">
    <rect width="260" height="74" rx="6" fill="#161b22" stroke="{YELLOW}" stroke-width="1.4"/>
    <rect x="256" y="0" width="4" height="74" rx="2" fill="{YELLOW}"/>
    <text x="14" y="20" font-size="10.5" font-weight="bold" fill="{YELLOW}">04 // PAYLOAD BAY (ГРОЗО)</text>
    <text x="14" y="37" font-size="12" font-weight="900" fill="#ffffff">Lakehouse &amp; Storage</text>
    <text x="14" y="52" font-size="10" fill="{CYAN}">• AWS S3 • Delta Lake • Snowflake</text>
    <text x="14" y="65" font-size="9" fill="{TEXT_MUTED}">30-ton modular high-capacity payload</text>
  </g>

  <!-- CARD 05: ENERGIA LAUNCHER -->
  <g transform="translate(705, 280)">
    <rect width="260" height="74" rx="6" fill="#161b22" stroke="{PINK}" stroke-width="1.4"/>
    <rect x="256" y="0" width="4" height="74" rx="2" fill="{PINK}"/>
    <text x="14" y="20" font-size="10.5" font-weight="bold" fill="{PINK}">05 // ENERGIA BOOSTER (ЭНЕРГИЯ)</text>
    <text x="14" y="37" font-size="12" font-weight="900" fill="#ffffff">Distributed Compute Engine</text>
    <text x="14" y="52" font-size="10" fill="{YELLOW}">• Apache Spark • Databricks • K8s</text>
    <text x="14" y="65" font-size="9" fill="{TEXT_MUTED}">100-ton superheavy workload pipeline</text>
  </g>

  <!-- CARD 06: TELEMETRY ARRAY -->
  <g transform="translate(705, 440)">
    <rect width="260" height="74" rx="6" fill="#161b22" stroke="{CYAN}" stroke-width="1.4"/>
    <rect x="256" y="0" width="4" height="74" rx="2" fill="{CYAN}"/>
    <text x="14" y="20" font-size="10.5" font-weight="bold" fill="{CYAN}">06 // TELEMETRY ARRAY (РАДИО)</text>
    <text x="14" y="37" font-size="12" font-weight="900" fill="#ffffff">Observability &amp; Lineage</text>
    <text x="14" y="52" font-size="10" fill="{YELLOW}">• OpenLineage • Monte Carlo • Metrics</text>
    <text x="14" y="65" font-size="9" fill="{TEXT_MUTED}">Continuous health telemetry &amp; drift audit</text>
  </g>

  <!-- Footer Technical Coordinates -->
  <g transform="translate(40, {SVG_HEIGHT - 38})">
    <text x="0" y="0" font-size="9.5" fill="{TEXT_MUTED}" letter-spacing="1">ORBITER: OK-1K1 BURAN • REUSABILITY: 100 CYCLES • LAUNCH COMPLEX: BAIKONUR PAD 110/37</text>
    <text x="0" y="14" font-size="9" fill="{CYAN}" letter-spacing="1.5">STACK: HELFSTEIN DATA PLATFORM • DESIGNED WITH SYNTHWAVE / VICE CITY PALETTE</text>
  </g>

  <g transform="translate({SVG_WIDTH - 210}, {SVG_HEIGHT - 28})">
    <text x="0" y="0" font-size="10" font-weight="bold" fill="{PINK}" letter-spacing="2">HELFSTEIN // BURAN 1.0</text>
  </g>
</svg>'''

if __name__ == "__main__":
    svg_content = generate_svg()
    target_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "buran_anatomy.svg")
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {target_path} ({len(svg_content)} bytes)")
