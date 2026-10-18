import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/mauriciohelfstein/.gemini/antigravity/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "/Users/mauriciohelfstein/.gemini/antigravity/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const WIDTH = 860;
const HEIGHT = 520;

const PLATE = { x: -128, y: -64, w: 262, d: 128, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const MAG = { x: -112, y: -20, w: 44, d: 40, r: 3 };
const MAG_H = 24;
const POST = [-98, 0];
const POST_TOP = 122;
const CLAMP_Z = 100;

const DIAL = [58, 0];
const DIAL_R = 20;
const DIAL_Z = 82;
const DIAL_H = 10;
const DIAL_TOP = DIAL_Z + DIAL_H;
const PER_TURN = 20;

const RAIL_FROM = 2;
const RAIL_TO = 124;
const CARRIAGE = { x: -28, y: -24, w: 56, d: 48, r: 3 };
const CARRIAGE_Z = 3;
const CARRIAGE_TOP = 8;
const BLOCKS = [18, 14, 10]; // Tier 1: MAURICE AI (18mm), Tier 2: Lakehouse (14mm), Tier 3: Pipelines (10mm)
const BLOCK_W = 15.6;
const STEP = 16;
const TIP_R = 2.6;
const CENTRE = -24 + BLOCK_W / 2;
const STOPS = BLOCKS.map((_, index) => DIAL[0] - CENTRE - STEP * index);
const REACH = [STOPS[STOPS.length - 1] - 6, STOPS[0] + 6];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [POST[0], POST[1], POST_TOP + 2], [DIAL[0] + DIAL_R, 0, DIAL_TOP]],
  WIDTH,
  HEIGHT,
  { pad: 32, azimuth: 42, elevation: 30 }
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// 1. TOOLING SURFACE PLATE
function buildPlate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }));

  // Calibrated measurement ruler strip on front bevel
  const strip = { x: -110, y: PLATE.y + PLATE.d - 15, w: 230, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));

  return out.join("");
}

// 2. PRECISION LINEAR RAILS
function buildRails() {
  const out = [];
  for (const y of [-20, 15]) {
    out.push(S(k.slabOf({ x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([RAIL_FROM + 6, RAIL_TO - 6].map((x) => at([x, y + 2.5, 3])), { size: 0.4, tone: "lo" }));
  }
  for (const x of [RAIL_FROM - 5, RAIL_TO]) {
    out.push(S(k.slabOf({ x, y: -23, w: 5, d: 46, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 2.5, -18, 7]), at([x + 2.5, 18, 7])], { size: 0.45, tone: "mid" }));
  }
  return out.join("");
}

// 3. MAGNETIC BASE FIXTURE & ARTICULATED POST
function buildFixture() {
  const out = [];
  out.push(S(k.slabOf(MAG, 0, 11, P, 6, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf(k.insetPlan(MAG, 0.8), 11, MAG_H - 11, P, 6, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(MAG, 3), MAG_H, P), { tone: "faint" }));
  out.push(D([at([MAG.x + 5, MAG.y + 5, MAG_H]), at([MAG.x + 5, MAG.y + MAG.d - 5, MAG_H]), at([MAG.x + MAG.w - 5, MAG.y + 5, MAG_H])], { size: 0.45 }));

  // Knurled ON/OFF switch knob
  const knob = [MAG.x + 32, MAG.y + 28];
  out.push(S(k.cylinder(knob[0], knob[1], 6, MAG_H, 4, P, 32), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1], 6, MAG_H, MAG_H + 4, 36, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([knob[0], knob[1]], [knob[0] + 6, knob[1]], MAG_H + 4, P), { tone: "hi" }));
  out.push(D([at([knob[0], knob[1], MAG_H + 4])], { size: 0.5, tone: "hi" }));

  // Vertical steel post
  out.push(S(k.cylinder(POST[0], POST[1], 5, MAG_H, 4, P, 28), { tone: "mid" }));
  const clamp = { x: POST[0] - 7, y: POST[1] - 7, w: 14, d: 14, r: 2.5 };
  out.push(S(k.slabOf(clamp, MAG_H + 4, 6, P, 3, 0.6), { tone: "mid" }));
  out.push(S(k.cylinder(POST[0], POST[1], 3.8, MAG_H + 10, POST_TOP - MAG_H - 10, P, 24), { tone: "hi" }));
  out.push(S(k.cylinder(POST[0], POST[1], 4.2, POST_TOP - 1, 3, P, 24), { tone: "mid" }));

  // Cross arm & clamping knuckle
  out.push(S(k.slabOf({ x: POST[0] - 6, y: POST[1] - 6, w: 12, d: 12, r: 2.5 }, CLAMP_Z - 5, 10, P, 3, 0.6), { tone: "mid" }));
  const thumb = [POST[0] - 6, POST[1] + 1];
  out.push(S(k.cylinder(thumb[0] - 4, thumb[1], 3.2, CLAMP_Z - 3, 6, P, 20), { tone: "mid" }));

  // Horizontal boom arm to dial
  out.push(S(k.slabOf({ x: POST[0] + 4, y: -2.8, w: DIAL[0] - POST[0] - DIAL_R - 2, d: 5.6, r: 1.2 }, CLAMP_Z - 2.5, 5, P, 3, 0.4), { tone: "hi" }));

  return out.join("");
}

// 4. SLIDING CARRIAGE & 3 GAUGE BLOCKS (DATA TIERS)
function buildCarriage() {
  const out = [];
  out.push(S(k.slabOf(CARRIAGE, 0, CARRIAGE_Z, P, 4, 0.6), { tone: "lo" }));
  out.push(S(k.slabOf(k.insetPlan(CARRIAGE, 2), CARRIAGE_Z, CARRIAGE_TOP - CARRIAGE_Z, P, 4, 0.8), { tone: "mid" }));

  // Bushing blocks & clamping screws
  for (const [x, y] of k.corners(CARRIAGE, 8)) {
    out.push(D([at([x, y, CARRIAGE_TOP])], { size: 0.4, tone: "lo" }));
  }

  // 3 Precision Gauge Blocks (Repository Data Tiers)
  // Block 1: 18mm -> Gold Tier (MAURICE AI & Reasoning)
  // Block 2: 14mm -> Silver Tier (Lakehouse & Iceberg)
  // Block 3: 10mm -> Bronze Tier (Pipelines & Ingestion)
  const blockLabels = ["18 (AI)", "14 (LAKE)", "10 (RAW)"];
  BLOCKS.forEach((h, i) => {
    const x = -24 + STEP * i;
    const plan = { x, y: -8, w: BLOCK_W, d: 16, r: 1.2 };
    out.push(S(k.slabOf(plan, CARRIAGE_TOP, h, P, 3, 0.4), { tone: i === 0 ? "lit" : i === 1 ? "hi" : "mid" }));
    out.push(L(k.planOutline(k.insetPlan(plan, 1.2), CARRIAGE_TOP + h, P, 3), { tone: "faint" }));
  });

  return out.join("");
}

// 5. PLUNGER PROBE (SENSOR)
function buildPlunger() {
  const out = [];
  const [x, y] = DIAL;
  out.push(S(k.cylinder(x, y, 1.6, -CARRIAGE_TOP, 54 + CARRIAGE_TOP, P, 18), { tone: "hi" }));
  out.push(S(k.cylinder(x, y, 2.2, 0, 1.6, P, 18), { tone: "lit" }));
  return out.join("");
}

// 6. DIAL INDICATOR GAUGE CASING & FACE
function buildDial() {
  const out = [];
  const [x, y] = DIAL;
  out.push(S(k.cylinder(x, y, 2.9, 54, DIAL_Z - 54, P, 20), { tone: "mid" }));
  out.push(L(k.sideArc(x, y, 2.9, 60, P, 12), { tone: "lo" }));
  out.push(S(k.slabOf({ x: x - DIAL_R - 6, y: -4, w: 8, d: 8, r: 1.5 }, DIAL_Z + 2, CLAMP_Z - DIAL_Z - 2, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, DIAL_R, DIAL_Z, DIAL_H, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3.4, DIAL_TOP, 84, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3.4, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, DIAL_R - 2.2, DIAL_TOP, P, 64), { tone: "lo" }));

  // Radial Ticks (50 divisions, major every 5th)
  const ticks = k.radialTicks(x, y, DIAL_R - 3, 50, 5, DIAL_TOP, [1.3, 2.8], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.6, DIAL_TOP, P, 16), { tone: "mid" }));

  // Inscriptions on dial face
  out.push(k.faceTextSvg(k.topMatrix([x, y + 10], DIAL_TOP, P, "x"), "0.01 mm", { size: 2.4, tone: "lo", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([x, y - 8], DIAL_TOP, P, "x"), "MAURICE", { size: 2.2, tone: "hi", anchor: "middle" }));

  return out.join("");
}

// Indicator needle calculator
const needleAt = (turn) => {
  const angle = turn * Math.PI * 2;
  const [x, y] = DIAL;
  return k.lineOnTop(
    [x - Math.sin(angle) * 3.4, y + Math.cos(angle) * 3.4],
    [x + Math.sin(angle) * (DIAL_R - 4), y - Math.cos(angle) * (DIAL_R - 4)],
    DIAL_TOP + 0.2,
    P
  );
};

// 7. TECHNICAL OVERLAYS & CALLOUTS (Anatomy Card Layout)
function buildOverlays() {
  const out = [];

  out.push(`
  <g class="iso-overlay" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace">
    <!-- Top-Left Corner -->
    <text x="32" y="36" font-size="11" font-weight="700" fill="#00e5ff" letter-spacing="1.5">No. 01 // DATA PRECISION GAUGE</text>
    <text x="32" y="52" font-size="9" fill="#8b949e" letter-spacing="1">LAKEHOUSE TOLERANCE AUDIT BENCH</text>

    <!-- Top-Right Corner -->
    <text x="${WIDTH - 32}" y="36" text-anchor="end" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">ANATOMY TEST BENCH · HELFSTEIN</text>
    <text x="${WIDTH - 32}" y="52" text-anchor="end" font-size="9" fill="#ff007c" letter-spacing="1">DATA QUALITY &amp; DRIFT AUDIT · 38 REPOS</text>

    <!-- Bottom-Left Corner -->
    <text x="32" y="${HEIGHT - 40}" font-size="10" fill="#ffea00" letter-spacing="1">BLOCK 1: MAURICE AI · READS 18.0 mm</text>
    <text x="32" y="${HEIGHT - 24}" font-size="8.5" fill="#8b949e" letter-spacing="0.5">SLIDE CARRIAGE ACROSS GAUGE BLOCKS · REVERSE-ORDER VERIFICATION</text>

    <!-- Bottom-Right Corner Readout -->
    <text x="${WIDTH - 32}" y="${HEIGHT - 40}" text-anchor="end" font-size="10.5" font-weight="700" fill="#00e5ff" letter-spacing="1">DRIFT 0.00 mm · 100% QUALITY PASS</text>
    <text x="${WIDTH - 32}" y="${HEIGHT - 24}" text-anchor="end" font-size="8.5" fill="#8b949e">GREAT EXPECTATIONS &amp; UNITY CATALOG</text>
  </g>
  `);

  // Callouts
  // 01. Dial Gauge: Telemetry & Quality
  const dialPt = at([DIAL[0], DIAL[1], DIAL_TOP]);
  const c1 = [WIDTH - 280, 110];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c1[0]},${c1[1]} ${dialPt[0] + 50},${c1[1]} ${dialPt[0]},${dialPt[1]}" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${dialPt[0]}" cy="${dialPt[1]}" r="3.5" fill="#00e5ff"/>
    <rect x="${c1[0] - 8}" y="${c1[1] - 18}" width="250" height="36" rx="4" fill="#161b22" stroke="#00e5ff" stroke-width="1.2"/>
    <text x="${c1[0]}" y="${c1[1] - 4}" font-size="9.5" font-weight="bold" fill="#00e5ff">01 // TELEMETRY DIAL GAUGE</text>
    <text x="${c1[0]}" y="${c1[1] + 10}" font-size="8.5" fill="#ffea00">Great Expectations · Schema Drift · Lineage</text>
  </g>
  `);

  // 02. Magnetic Fixture: Cloud Backbone
  const magPt = at([MAG.x + MAG.w / 2, MAG.y + MAG.d / 2, MAG_H]);
  const c2 = [40, 140];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c2[0] + 240},${c2[1]} ${magPt[0] - 40},${c2[1]} ${magPt[0]},${magPt[1]}" fill="none" stroke="#ff007c" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${magPt[0]}" cy="${magPt[1]}" r="3.5" fill="#ff007c"/>
    <rect x="${c2[0]}" y="${c2[1] - 18}" width="240" height="36" rx="4" fill="#161b22" stroke="#ff007c" stroke-width="1.2"/>
    <text x="${c2[0] + 8}" y="${c2[1] - 4}" font-size="9.5" font-weight="bold" fill="#ff007c">02 // MAGNETIC BASE FIXTURE</text>
    <text x="${c2[0] + 8}" y="${c2[1] + 10}" font-size="8.5" fill="#00e5ff">AWS · OpenShift Platform · IaC Terraform</text>
  </g>
  `);

  // 03. 3 Gauge Blocks: Lakehouse Tiers
  const blockPt = at([15, 0, CARRIAGE_TOP + 14]);
  const c3 = [WIDTH - 280, 440];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c3[0]},${c3[1]} ${blockPt[0] + 50},${c3[1]} ${blockPt[0]},${blockPt[1]}" fill="none" stroke="#ffea00" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${blockPt[0]}" cy="${blockPt[1]}" r="3.5" fill="#ffea00"/>
    <rect x="${c3[0] - 8}" y="${c3[1] - 18}" width="250" height="36" rx="4" fill="#161b22" stroke="#ffea00" stroke-width="1.2"/>
    <text x="${c3[0]}" y="${c3[1] - 4}" font-size="9.5" font-weight="bold" fill="#ffea00">03 // 3 REPOSITORY DATA BLOCKS</text>
    <text x="${c3[0]}" y="${c3[1] + 10}" font-size="8.5" fill="#00e5ff">18mm MAURICE AI • 14mm Lakehouse • 10mm ETL</text>
  </g>
  `);

  return out.join("");
}

// 8. SCREEN TRANSLATIONS FOR SVG KEYFRAMES
const startX = STOPS[0];
const stop0Trans = k.translateAlong(P, [STOPS[0], 0, 0]);
const stop1Trans = k.translateAlong(P, [STOPS[1], 0, 0]);
const stop2Trans = k.translateAlong(P, [STOPS[2], 0, 0]);

const plunger0Trans = k.translateAlong(P, [0, 0, CARRIAGE_TOP + BLOCKS[0]]);
const plunger1Trans = k.translateAlong(P, [0, 0, CARRIAGE_TOP + BLOCKS[1]]);
const plunger2Trans = k.translateAlong(P, [0, 0, CARRIAGE_TOP + BLOCKS[2]]);

// Needle paths for each height
const needlePath0 = needleAt(BLOCKS[0] / PER_TURN);
const needlePath1 = needleAt(BLOCKS[1] / PER_TURN);
const needlePath2 = needleAt(BLOCKS[2] / PER_TURN);

// PURE SVG CSS ANIMATION (Runs continuously on GitHub profile README)
const DIAL_ANIMATION_CSS = `
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
  cursor: pointer;
}
/* Smooth Carriage Travel Animation across the 3 Repository Blocks */
@keyframes animCarriage {
  0%, 25% { transform: ${stop0Trans}; }
  33%, 58% { transform: ${stop1Trans}; }
  66%, 92% { transform: ${stop2Trans}; }
  100% { transform: ${stop0Trans}; }
}
@keyframes animPlunger {
  0%, 25% { transform: ${plunger0Trans}; }
  33%, 58% { transform: ${plunger1Trans}; }
  66%, 92% { transform: ${plunger2Trans}; }
  100% { transform: ${plunger0Trans}; }
}
.anim-carriage {
  animation: animCarriage 7.5s cubic-bezier(0.32, 0.72, 0, 1) infinite;
}
.anim-plunger {
  animation: animPlunger 7.5s cubic-bezier(0.32, 0.72, 0, 1) infinite;
}
.anim-needle {
  transform-origin: ${at([DIAL[0], DIAL[1], DIAL_TOP + 0.2])[0]}px ${at([DIAL[0], DIAL[1], DIAL_TOP + 0.2])[1]}px;
  transition: transform 0.5s ease;
}
`;

// Build Animated SVG for GitHub README
const svgBody = [
  buildPlate(),
  buildRails(),
  buildFixture(),
  `<g class="anim-carriage" data-part="carriage">${buildCarriage()}</g>`,
  `<g class="anim-plunger" data-part="plunger">${buildPlunger()}</g>`,
  buildDial(),
  `<path class="iso-line anim-needle" data-part="needle" data-tone="lit" data-free="start" d="${needlePath0}" style="stroke-width:1.3; stroke:#ffea00;"/>`,
  buildOverlays()
].join("\n");

const svgOutput = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Data Precision Dial Indicator Benchmark Rig",
  body: `<style>${k.ISO_CSS}\n${DIAL_ANIMATION_CSS}</style>\n${svgBody}`,
  standalone: "dark"
});

const targetSvgPath = join(HERE, "dial_indicator.svg");
writeFileSync(targetSvgPath, svgOutput, "utf-8");
console.log(`✓ Generated Animated Dial Indicator SVG: ${targetSvgPath} (${svgOutput.length} bytes)`);

// Full Interactive HTML Version (Mouse drag, arrow keys, live numerical readout)
const interactiveSvg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Data Precision Dial Indicator Benchmark Rig",
  body: [
    buildPlate(),
    buildRails(),
    buildFixture(),
    `<g data-part="carriage" transform="${stop0Trans}">${buildCarriage()}</g>`,
    `<g data-part="plunger" transform="${plunger0Trans}">${buildPlunger()}</g>`,
    buildDial(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needlePath0}" style="stroke-width:1.3; stroke:#ffea00;"/>`,
    buildOverlays()
  ],
});

const liveJs = `
const P = ${JSON.stringify(P)};
const BLOCKS = ${JSON.stringify(BLOCKS)};
const DIAL = ${JSON.stringify(DIAL)};
const DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP}, PER_TURN = ${PER_TURN}, STEP = ${STEP}, BLOCK_W = ${BLOCK_W}, TIP_R = ${TIP_R}, BASE = ${CARRIAGE_TOP};
const REACH = ${JSON.stringify(REACH)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const carriage = svg.querySelector('[data-part="carriage"]');
const plunger = svg.querySelector('[data-part="plunger"]');
const needle = svg.querySelector('[data-part="needle"]');
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const stops = ${JSON.stringify(STOPS)};
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const blockNames = ["Block 1: MAURICE AI Core (18mm)", "Block 2: Iceberg Lakehouse (14mm)", "Block 3: Ingestion Pipeline (10mm)"];
const heightUnder = (cx) => {
  let top = BASE;
  BLOCKS.forEach((height, index) => {
    const from = cx - 24 + STEP * index, to = from + BLOCK_W;
    if (to > DIAL[0] - TIP_R && from < DIAL[0] + TIP_R) top = Math.max(top, BASE + height);
  });
  return top;
};
const blockUnder = (cx) => BLOCKS.findIndex((_, index) => { const from = cx - 24 + STEP * index; return DIAL[0] >= from && DIAL[0] <= from + BLOCK_W; });
const needleAt = ${needleAt.toString().replace("k.lineOnTop", "lineOnTop")};
let x = ${startX}, target = x, tip = { at: BASE + BLOCKS[0], rate: 0 };
let frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0;
const tourAt = (t) => stops[Math.floor(t / 2.4) % stops.length];

function draw() {
  carriage.setAttribute("transform", translateAlong(P, [x, 0, 0]));
  plunger.setAttribute("transform", translateAlong(P, [0, 0, tip.at]));
  needle.setAttribute("d", needleAt((tip.at - BASE) / PER_TURN));
  const index = blockUnder(x);
  const text = (index < 0 ? "Between Blocks · Gap" : blockNames[index]) + " · Drift: " + ((tip.at - BASE) === 18 ? "0.00 mm (100% PASS)" : "nominal");
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(Math.round(tip.at - BASE)));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) { clock += dt; target = tourAt(clock); }
  x = calm ? target : x + (target - x) * (1 - Math.exp(-dt / 0.28));
  if (Math.abs(target - x) < 0.01) x = target;
  const want = heightUnder(x);
  const stiff = 420, drag = calm ? 2 * Math.sqrt(420) : 26;
  for (let i = 0; i < 4; i++) { tip.rate += ((want - tip.at) * stiff - tip.rate * drag) * dt / 4; tip.at += tip.rate * dt / 4; }
  if (Math.abs(want - tip.at) < 0.005 && Math.abs(tip.rate) < 0.005) { tip.at = want; tip.rate = 0; }
  draw();
  const settled = !touring && x === target && tip.rate === 0 && tip.at === want;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = clamp(next, REACH[0], REACH[1]); clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 3600); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = clamp(((event.clientX - box.left) / box.width - 0.22) / 0.56, 0, 1);
  steer(REACH[0] + share * (REACH[1] - REACH[0]));
});
stage.addEventListener("pointerleave", () => steer(target));
stage.addEventListener("keydown", (event) => {
  const here = stops.reduce((best, stop, index) => (Math.abs(stop - target) < Math.abs(stops[best] - target) ? index : best), 0);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.max(0, here - 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.min(stops.length - 1, here + 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = stops.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(stops[to]);
});
draw();
`;

const plateHtml = k.plateHtml({
  fig: "No. 01 // DATA GAUGE",
  title: "Precision Dial Indicator Benchmark Rig",
  hint: "Mova o mouse ou use setas do teclado para deslizar o carro",
  readout: "Block 1: MAURICE AI Core (18mm) · Drift: 0.00 mm (100% PASS)",
  keys: [
    { mark: "lit", label: "Block 1: MAURICE AI Reasoning (18mm height)" },
    { mark: "raised", label: "Block 2: Apache Iceberg & Delta Lakehouse (14mm height)" },
    { mark: "flat", label: "Block 3: Ingestion & Orchestration Pipelines (10mm height)" },
    { mark: "edge", label: "Plunger Sensor & Dial Gauge: Data Quality & Schema Tolerance" }
  ],
  caption:
    "Bancada micrométrica oficial do Anatomy adaptada para a auditoria de tolerância e qualidade de dados de 38 repositórios. Conforme o carro se desloca sobre os trilhos, o sensor vertical acompanha os blocos de dados e o ponteiro gira com precisão de 0.01 mm.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Bancada de Relógio Comparador de Precisão">${interactiveSvg}</div>`,
});

const page = k.pageHtml({
  title: "Precision Dial Indicator Benchmark // Helfstein Repositories",
  theme: "dark",
  body: plateHtml,
  script: kitScript() + liveJs,
  width: WIDTH
});

const targetHtmlPath = join(HERE, "dial_indicator.html");
writeFileSync(targetHtmlPath, page, "utf-8");
console.log(`✓ Generated Interactive Dial Indicator HTML: ${targetHtmlPath} (${page.length} bytes)`);
