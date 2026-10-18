import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/mauriciohelfstein/.gemini/antigravity/skills/anatomy/kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const WIDTH = 980;
const HEIGHT = 640;

// Base Plate (Instrument Bench)
const PLATE = { x: -115, y: -95, w: 230, d: 240, r: 10 };
const PLATE_H = 10;
const FOOT_H = 5;

// Computer Case Dimensions (MAURICE Workstation)
const CASE = { x: -62, y: -62, w: 124, d: 118, r: 8 };
const FRONT = CASE.y + CASE.d;
const SIDE = CASE.x + CASE.w;
const PLINTH_H = 5;
const TOP = 168;
const SEAM = FRONT - 12;

// CRT Screen & Bezel Dimensions
const BEZEL = { x0: -48, x1: 48, z0: 68, z1: 156, r: 6, depth: 2 };
const CRT = { x0: -41, x1: 41, z0: 76, z1: 148, r: 8, depth: 5 };
const CRT_MID = (CRT.z0 + CRT.z1) / 2;

// Storage Cartridges / Drive Slots (Lakehouse Sleds)
const SLOT1 = { x0: 6, x1: 48, z0: 44, z1: 50, r: 2, depth: 4 };
const SLOT2 = { x0: 6, x1: 48, z0: 34, z1: 40, r: 2, depth: 4 };

// Keyboard Dimensions
const KB = { x: -75, y: 78, w: 150, d: 56, r: 4 };
const KB_Z = 1.6;
const KB_TOP = 8.6;
const U = 9.0;
const KEYS_X = -U * 7.5;
const KEYS_Y = 82;

const ROWS = [
  [["`", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["Bksp", 2]],
  [["Tab", 1.5], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["[", 1], ["]", 1], ["\\", 1.5]],
  [["Ctrl", 1.75], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1], ["J", 1], ["K", 1], ["L", 1], [";", 1], ["'", 1], ["Enter", 2.25]],
  [["Shift", 2.25], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1], ["M", 1], [",", 1], [".", 1], ["/", 1], ["Shift", 2.75]],
  [["MCP", 1.5], ["AI", 1.5], [" ", 9], ["SPARK", 1.5], ["LOOP", 1.5]],
];
const ROW_H = [5.4, 5.0, 4.6, 4.2, 3.8];

// MCP Port & Coiled Keyboard Cable
const PORT = { y: 28, z: 9 };
const COIL = { x: 80, z: 3.6, r: 3.2, from: 44, to: 80, turns: 16 };

// Camera projection (Azimuth 56°, Elevation 30°)
const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    ...k.boxCorners(CASE, 0, TOP),
    [KB.x + KB.w + 10, KB.y + KB.d, KB_TOP]
  ],
  WIDTH,
  HEIGHT,
  { pad: 36, azimuth: 55, elevation: 30 }
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left");
const flat = (x0, z0, x1, z1, r, steps = 6) =>
  k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);

// 1. BASE INSTRUMENT PLATE & FEET
function buildPlate() {
  const out = [];

  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);

  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H, 1.8, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.8, -PLATE_H - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: "mid" }));
    out.push(L(k.knurl(x, y, 5.8, -PLATE_H - FOOT_H + 1.8, -PLATE_H - FOOT_H + FOOT_H, 24, P), { tone: "faint" }));
  }

  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));

  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }));

  // Metric ruler strip on front
  const ruler = { x: -95, y: PLATE.y + PLATE.d - 14, w: 190, d: 6, r: 1 };
  out.push(S(k.slabOf(ruler, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(ruler.x + 4, ruler.x + ruler.w - 4, 4, 5, ruler.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([ruler.x + 2, ruler.y + 3, 0.6]), at([ruler.x + ruler.w - 2, ruler.y + 3, 0.6])], { size: 0.45 }));

  // Technical Engraved Badge
  const label = { x: -100, y: 120, w: 32, d: 14, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([22, 16].map((w, i) => k.lineOnTop([label.x + 4, label.y + 4 + i * 4], [label.x + 4 + w, label.y + 4 + i * 4], 0.8, P)).join(""), { tone: "hi", free: true }));

  return out.join("");
}

// 2. CRT SCREEN & TELEMETRY DISPLAY
function buildScreen() {
  const lines = [];
  for (let z = CRT.z0 + 1.2; z < CRT.z1; z += 2.0) {
    lines.push(`M${CRT.x0} ${(-z).toFixed(1)}H${CRT.x1}`);
  }

  const glow = flat(-34, CRT.z0 + 8, 34, CRT.z1 - 8, 20, 10);
  const textX = CRT.x0 + 6;

  // Real Repository Telemetry rendered directly onto the CRT face
  const screenContent = `
    <path class="pc-glow" d="${glow}" fill="rgba(0, 229, 255, 0.08)"/>
    <path class="pc-scan" d="${lines.join("")}" stroke="rgba(0, 229, 255, 0.12)" stroke-width="0.6"/>
    
    <!-- Neon CRT Terminal Output -->
    <text x="${textX}" y="${-(CRT.z1 - 14)}" font-size="4.4" font-weight="bold" fill="#00e5ff" font-family="monospace">&gt; MAURICE // REASONING INFERENCE</text>
    <text x="${textX}" y="${-(CRT.z1 - 22)}" font-size="3.8" fill="#ffea00" font-family="monospace">&gt; AGENT: STEWARD (UNITY CATALOG)</text>
    <text x="${textX}" y="${-(CRT.z1 - 30)}" font-size="3.8" fill="#ff007c" font-family="monospace">&gt; PROTOCOL: JULES MCP [READY]</text>
    <text x="${textX}" y="${-(CRT.z1 - 38)}" font-size="3.8" fill="#00e5ff" font-family="monospace">&gt; LAKEHOUSE: ICEBERG + SPARK</text>
    <text x="${textX}" y="${-(CRT.z1 - 46)}" font-size="3.8" fill="#8b949e" font-family="monospace">&gt; PIPELINES: AIRFLOW / KEDRO</text>
    <text x="${textX}" y="${-(CRT.z1 - 56)}" font-size="4.2" font-weight="900" fill="#ffea00" font-family="monospace">&gt; 38 REPOS · EVENT HORIZON 100%</text>

    <!-- Glowing Blinking Cursor -->
    <rect x="${textX + 70}" y="${-(CRT.z1 - 59)}" width="3.5" height="5" fill="#ff007c"/>
  `;

  const bezelShape = flat(BEZEL.x0, BEZEL.z0, BEZEL.x1, BEZEL.z1, BEZEL.r);
  const crtShape = flat(CRT.x0, CRT.z0, CRT.x1, CRT.z1, CRT.r);

  return `
  <!-- Bezel & CRT Recess -->
  <g transform="${planeOf(FRONT)}">
    <path class="iso-shade" data-shade="1" d="${bezelShape}"/>
    <path class="iso-line" data-tone="lo" d="${bezelShape}"/>
  </g>
  <g transform="${planeOf(FRONT - BEZEL.depth)}">
    <path class="iso-shade" data-shade="0" d="${crtShape}" fill="#0d1117"/>
    ${screenContent}
    <path class="iso-line" data-tone="mid" d="${crtShape}" stroke="#00e5ff"/>
  </g>
  `;
}

// 3. MAIN WORKSTATION CASE & STORAGE SLEDS
function buildComputer() {
  const out = [];

  out.push(`<path class="iso-halo" d="${k.haloOf(CASE, 0, 8, P)}"/>`);
  out.push(S(k.slabOf(k.insetPlan(CASE, 3), 0, PLINTH_H, P, 8), { tone: "lo" }));
  out.push(S(k.slabOf(CASE, PLINTH_H, TOP - PLINTH_H, P, 8, 1.6), { tone: "mid" }));

  // Top Handle & cooling vents
  const handle = { x: -42, y: CASE.y + 7, w: 84, d: 11, r: 5.5 };
  out.push(L(k.planOutline(handle, TOP, P, 8), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(handle, 2.2), TOP, P, 8), { tone: "faint" }));

  // Side Chassis Seam & Ventilation slots
  out.push(L(k.lineOnTop([CASE.x, SEAM], [SIDE, SEAM], TOP, P) + k.segment([SIDE, SEAM, TOP], [SIDE, SEAM, PLINTH_H], P), { tone: "lo" }));

  // Embed CRT Screen
  out.push(buildScreen());

  // Dual Modular Lakehouse Drive Slots (Spark/Iceberg & Airflow)
  const slot1Shape = flat(SLOT1.x0, SLOT1.z0, SLOT1.x1, SLOT1.z1, SLOT1.r);
  const slot2Shape = flat(SLOT2.x0, SLOT2.z0, SLOT2.x1, SLOT2.z1, SLOT2.r);
  out.push(`
  <g transform="${planeOf(FRONT)}">
    <path class="iso-shade" data-shade="0" d="${slot1Shape}" fill="#161b22"/>
    <path class="iso-line" data-tone="lo" d="${slot1Shape}"/>
    <text x="${SLOT1.x0 + 4}" y="${-(SLOT1.z0 + 1.5)}" font-size="3" fill="#00e5ff" font-family="monospace">BAY 01 // ICEBERG</text>

    <path class="iso-shade" data-shade="0" d="${slot2Shape}" fill="#161b22"/>
    <path class="iso-line" data-tone="lo" d="${slot2Shape}"/>
    <text x="${SLOT2.x0 + 4}" y="${-(SLOT2.z0 + 1.5)}" font-size="3" fill="#ff7b00" font-family="monospace">BAY 02 // SPARK</text>
  </g>
  `);

  // Speaker Grille slots & Activity LEDs
  out.push(`<g transform="${planeOf(FRONT)}">${L(Array.from({ length: 8 }, (_, i) => flat(-46 + i * 3, 36, -44.6 + i * 3, 50, 0.7, 4)).join(""), { tone: "lo" })}</g>`);
  out.push(D([at([-45, FRONT, 30])], { size: 0.9, tone: "lit" }));
  out.push(D([at([-41, FRONT, 30])], { size: 0.8, tone: "hi" }));

  // Rocker Power Switch on Side
  const ry = CASE.y + 10;
  out.push(S(k.slabOf({ x: SIDE, y: ry, w: 1.2, d: 12, r: 1 }, 12, 16, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: SIDE + 1.2, y: ry + 2, w: 2.2, d: 8, r: 0.8 }, 14, 12, P, 2), { tone: "hi" }));

  // MCP Patchbay Ports on Right Flank
  out.push(S(k.slabOf({ x: SIDE - 0.4, y: PORT.y - 2, w: 1.4, d: 16, r: 1 }, PORT.z - 2, 14, P, 3), { tone: "lo" }));
  out.push(S(k.cylinder(SIDE + 1.2, PORT.y + 2, 2.8, PORT.z + 1, 3, P, 18), { tone: "hi" }));
  out.push(S(k.cylinder(SIDE + 1.2, PORT.y + 10, 2.8, PORT.z + 1, 3, P, 18), { tone: "hi" }));
  out.push(D([at([SIDE + 4.2, PORT.y + 2, PORT.z + 2.5])], { size: 0.6, tone: "lit" }));
  out.push(D([at([SIDE + 4.2, PORT.y + 10, PORT.z + 2.5])], { size: 0.6, tone: "lit" }));

  return out.join("");
}

// 4. MECHANICAL KEYBOARD & COILED CORD
function buildKeyboard() {
  const out = [];

  out.push(`<path class="iso-halo" d="${k.haloOf(KB, 0, 4, P)}"/>`);
  for (const [x, y] of byDepth(k.corners(KB, 8))) {
    out.push(S(k.cylinder(x, y, 2.8, 0, KB_Z, P, 16), { tone: "lo" }));
  }
  out.push(S(k.slabOf(KB, KB_Z, KB_TOP - KB_Z, P, 6, 1), { tone: "mid" }));

  const well = { x: KEYS_X - 1.4, y: KEYS_Y - 1.4, w: U * 15 + 2.8, d: U * 5 + 2.8, r: 2 };
  out.push(L(k.planOutline(well, KB_TOP, P, 4), { tone: "lo" }));
  out.push(D([at([KB.x + 4, KB.y + 2.4, KB_TOP]), at([KB.x + KB.w - 4, KB.y + 2.4, KB_TOP])], { size: 0.45 }));

  ROWS.forEach((row, r) => {
    let x = KEYS_X;
    for (const [code, width] of row) {
      const plan = { x: x + 0.6, y: KEYS_Y + r * U + 0.6, w: width * U - 1.2, d: U - 1.2, r: 1.2 };
      const h = ROW_H[r];
      const isSpecial = code === "MCP" || code === "AI" || code === "SPARK" || code === "LOOP";
      out.push(S(k.slabOf(plan, KB_TOP, h, P, 3, 0.4), { tone: isSpecial ? "hi" : "mid", crease: "faint" }));
      x += width * U;
    }
  });

  // Coiled cable connecting keyboard to chassis MCP port
  const start = [COIL.x + COIL.r, COIL.from, COIL.z];
  const end = [COIL.x + COIL.r, COIL.to, COIL.z];
  const curve = (points) => k.pathOf(points.map((pt) => at(pt)));
  out.push(`<path class="iso-line pc-cord" data-tone="mid" d="${curve([[SIDE + 8, PORT.y + 3, PORT.z + 3], [SIDE + 14, PORT.y + 5, PORT.z + 2], [SIDE + 18, PORT.y + 9, COIL.z + 2], start])}"/>`);
  const spring = k.coil(COIL.from, COIL.to, [COIL.x, COIL.z], COIL.r, COIL.turns, "y", P);
  out.push(L(spring.back, { tone: "lo" }), L(spring.front, { tone: "mid" }));
  out.push(`<path class="iso-line pc-cord" data-tone="mid" d="${curve([end, [COIL.x + 2, COIL.to + 3, COIL.z + 0.2], [KB.x + KB.w + 4, 85, 4.5]])}"/>`);

  return out.join("");
}

// 5. TECHNICAL CORNER PLATES & REPOSITORY CALLOUTS
function buildOverlays() {
  const out = [];

  // Corner Plates
  out.push(`
  <g class="iso-overlay" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace">
    <!-- Top-Left Corner -->
    <text x="32" y="36" font-size="11" font-weight="700" fill="#00e5ff" letter-spacing="1.5">No. 42 // MAURICE CORE</text>
    <text x="32" y="52" font-size="9" fill="#8b949e" letter-spacing="1">AI REASONING &amp; LAKEHOUSE TERMINAL</text>

    <!-- Top-Right Corner -->
    <text x="${WIDTH - 32}" y="36" text-anchor="end" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">ANATOMY WORKSTATION · HELFSTEIN</text>
    <text x="${WIDTH - 32}" y="52" text-anchor="end" font-size="9" fill="#ff007c" letter-spacing="1">EVENT-HORIZON DISCIPLINE · MCP READY</text>

    <!-- Bottom-Left Corner -->
    <text x="32" y="${HEIGHT - 44}" font-size="10" fill="#ffea00" letter-spacing="1">38 REPOSITORIES · PIPELINES &amp; AGENTS ACTIVE</text>
    <text x="32" y="${HEIGHT - 28}" font-size="9" fill="#8b949e" letter-spacing="0.5">SPARK · ICEBERG · DATABRICKS · LANGGRAPH · JULES MCP</text>

    <!-- Bottom-Right Corner Readout -->
    <text x="${WIDTH - 32}" y="${HEIGHT - 44}" text-anchor="end" font-size="10.5" font-weight="700" fill="#00e5ff" letter-spacing="1">LATENCY 12ms · 100% AUTONOMOUS</text>
    <text x="${WIDTH - 32}" y="${HEIGHT - 28}" text-anchor="end" font-size="9" fill="#8b949e">TOKEN OPTIMIZATION NOMINAL</text>
  </g>
  `);

  // Subsystem Callout Cards mapped to User's Repositories
  // 01. CRT Screen: MAURICE & Agent Reasoning Core
  const crtPt = at([0, FRONT - 5, CRT_MID]);
  const c1Text = [40, 115];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c1Text[0] + 250},${c1Text[1]} ${crtPt[0] - 60},${c1Text[1]} ${crtPt[0]},${crtPt[1]}" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${crtPt[0]}" cy="${crtPt[1]}" r="3.5" fill="#00e5ff"/>
    <rect x="${c1Text[0]}" y="${c1Text[1] - 18}" width="250" height="36" rx="4" fill="#161b22" stroke="#00e5ff" stroke-width="1.2"/>
    <text x="${c1Text[0] + 8}" y="${c1Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#00e5ff">01 // MAURICE REASONING ENGINE</text>
    <text x="${c1Text[0] + 8}" y="${c1Text[1] + 10}" font-size="8.5" fill="#ffea00">maurice · maus-ai · hermes-ai-midas</text>
  </g>
  `);

  // 02. Storage Bays: Spark & Iceberg Data Lakehouse
  const bayPt = at([SLOT1.x1, FRONT, SLOT1.z0 + 2]);
  const c2Text = [40, 240];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c2Text[0] + 250},${c2Text[1]} ${bayPt[0] - 50},${c2Text[1]} ${bayPt[0]},${bayPt[1]}" fill="none" stroke="#ffea00" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${bayPt[0]}" cy="${bayPt[1]}" r="3.5" fill="#ffea00"/>
    <rect x="${c2Text[0]}" y="${c2Text[1] - 18}" width="250" height="36" rx="4" fill="#161b22" stroke="#ffea00" stroke-width="1.2"/>
    <text x="${c2Text[0] + 8}" y="${c2Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#ffea00">02 // LAKEHOUSE DRIVE SLEDS</text>
    <text x="${c2Text[0] + 8}" y="${c2Text[1] + 10}" font-size="8.5" fill="#00e5ff">spark-iceberg · emr-serverless · duckdb</text>
  </g>
  `);

  // 03. MCP Patchbay: Jules MCP & Model Context Protocol
  const mcpPt = at([SIDE + 2, PORT.y + 6, PORT.z + 4]);
  const c3Text = [WIDTH - 290, 115];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c3Text[0]},${c3Text[1]} ${mcpPt[0] + 60},${c3Text[1]} ${mcpPt[0]},${mcpPt[1]}" fill="none" stroke="#ff007c" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${mcpPt[0]}" cy="${mcpPt[1]}" r="3.5" fill="#ff007c"/>
    <rect x="${c3Text[0] - 8}" y="${c3Text[1] - 18}" width="260" height="36" rx="4" fill="#161b22" stroke="#ff007c" stroke-width="1.2"/>
    <text x="${c3Text[0]}" y="${c3Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#ff007c">03 // MODEL CONTEXT PROTOCOL (MCP)</text>
    <text x="${c3Text[0]}" y="${c3Text[1] + 10}" font-size="8.5" fill="#ffea00">jules-ai-mcp · databricks-forge-cli</text>
  </g>
  `);

  // 04. Data Governance & Steward Agent (Side Chassis)
  const stewPt = at([SIDE, CASE.y + 30, TOP - 30]);
  const c4Text = [WIDTH - 290, 240];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c4Text[0]},${c4Text[1]} ${stewPt[0] + 50},${c4Text[1]} ${stewPt[0]},${stewPt[1]}" fill="none" stroke="#ff7b00" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${stewPt[0]}" cy="${stewPt[1]}" r="3.5" fill="#ff7b00"/>
    <rect x="${c4Text[0] - 8}" y="${c4Text[1] - 18}" width="260" height="36" rx="4" fill="#161b22" stroke="#ff7b00" stroke-width="1.2"/>
    <text x="${c4Text[0]}" y="${c4Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#ff7b00">04 // DATA GOVERNANCE &amp; STEWARD</text>
    <text x="${c4Text[0]}" y="${c4Text[1] + 10}" font-size="8.5" fill="#00e5ff">databricks-steward-agent · Unity Catalog</text>
  </g>
  `);

  // 05. Keyboard & Job Loops (Bottom Keyboard)
  const kbPt = at([0, KB.y + KB.d / 2, KB_TOP + 4]);
  const c5Text = [WIDTH - 290, 480];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c5Text[0]},${c5Text[1]} ${kbPt[0] + 50},${c5Text[1]} ${kbPt[0]},${kbPt[1]}" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${kbPt[0]}" cy="${kbPt[1]}" r="3.5" fill="#00e5ff"/>
    <rect x="${c5Text[0] - 8}" y="${c5Text[1] - 18}" width="260" height="36" rx="4" fill="#161b22" stroke="#00e5ff" stroke-width="1.2"/>
    <text x="${c5Text[0]}" y="${c5Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#00e5ff">05 // WORKFLOW LOOPS &amp; PIPELINES</text>
    <text x="${c5Text[0]}" y="${c5Text[1] + 10}" font-size="8.5" fill="#ffea00">open-job-loop · airflow-dbt · KedroArk</text>
  </g>
  `);

  return out.join("");
}

// 6. ASSEMBLE
function buildFigure() {
  return [
    buildPlate(),
    buildComputer(),
    buildKeyboard(),
    buildOverlays()
  ].join("\n");
}

// 7. VICE CITY SYNTHWAVE PALETTE OVERRIDES
const VICE_CITY_CSS = `
.iso {
  --anatomy-page: #0d1117;
  --anatomy-card: #161b22;
  --anatomy-text: #8b949e;
  --anatomy-strong: #f0f6fc;
  --anatomy-muted: #58a6ff;
  --anatomy-paper: #0d1117;
  --anatomy-face: #161b22;
  --anatomy-top: #1f242c;
  --anatomy-shade-0: #10141a;
  --anatomy-shade-1: #141922;
  --anatomy-shade-2: #181f2a;
  --anatomy-shade-3: #1e2634;
  --anatomy-edge-faint: rgba(0, 229, 255, 0.2);
  --anatomy-edge-lo: rgba(0, 229, 255, 0.45);
  --anatomy-edge-mid: #00e5ff;
  --anatomy-edge-hi: #ff007c;
  --anatomy-lit: #ffea00;
  --anatomy-accent: #ff7b00;
  --anatomy-accent-ink: #ff007c;
  --anatomy-bevel: rgba(0, 229, 255, 0.35);
  --anatomy-halo: rgba(0, 229, 255, 0.12);
  --anatomy-grid: rgba(0, 229, 255, 0.08);
}
.iso-svg {
  background: #0d1117;
  border-radius: 12px;
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.08);
}
`;

// 8. OUTPUT STANDALONE SVG & HTML
const body = buildFigure();
const svgOutput = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "MAURICE AI & Lakehouse Anatomy Workstation",
  body: `<style>${k.ISO_CSS}\n${VICE_CITY_CSS}</style>\n${body}`,
  standalone: "dark"
});

const targetSvgPath = join(HERE, "anatomy_workstation.svg");
writeFileSync(targetSvgPath, svgOutput, "utf-8");
console.log(`✓ Generated Terminal Anatomy SVG: ${targetSvgPath} (${svgOutput.length} bytes)`);

// Full HTML Plate
const plate = k.plateHtml({
  fig: "No. 42 // MAURICE",
  title: "AI Reasoning & Lakehouse Workstation",
  hint: "Event-Horizon Discipline · MCP Connected",
  readout: "100.0% autonomous · 38 repos active",
  keys: [
    { mark: "lit", label: "MAURICE AI Reasoning (Python 3.12 / LLM Inference)" },
    { mark: "raised", label: "Model Context Protocol & Governance (Jules MCP / Unity Catalog)" },
    { mark: "flat", label: "Distributed Lakehouse Compute (Spark / Iceberg / EMR)" },
    { mark: "edge", label: "Orchestration & Workflow Loops (Airflow / Open-Job-Loop / Kedro)" }
  ],
  caption: "Isometric Anatomy terminal workstation representing Mauricio Helfstein's 38 GitHub repositories: from autonomous AI agent inference to distributed Spark Lakehouse pipelines.",
  body: svgOutput
});

const page = k.pageHtml({
  title: "MAURICE AI & Lakehouse Anatomy Workstation // Helfstein",
  theme: "dark",
  body: plate,
  width: WIDTH
});

const targetHtmlPath = join(HERE, "anatomy_workstation.html");
writeFileSync(targetHtmlPath, page, "utf-8");
console.log(`✓ Generated Terminal Anatomy HTML: ${targetHtmlPath} (${page.length} bytes)`);
