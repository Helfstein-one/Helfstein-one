import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "/Users/mauriciohelfstein/.gemini/antigravity/skills/anatomy/kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// Dimensions matching standard Anatomy figures
const WIDTH = 960;
const HEIGHT = 620;

// Bench Plate: Ground instrument tooling plate
const PLATE = { x: -110, y: -72, w: 220, d: 144, r: 8 };
const PLATE_H = 10;
const FOOT_H = 6;

// Shuttle Coordinates (X is lengthwise: Nose at +X, Engines at -X)
const FUSE_Z = 24;
const NOSE_X = 62;
const TAIL_X = -65;

// Support Pylons / Cradle
const CRADLE_FRONT_X = 20;
const CRADLE_REAR_X = -45;

// Telemetry Dial Gauge
const DIAL_POS = [75, 46];
const DIAL_Z = 26;
const DIAL_R = 14;

// Fit Isometric Camera (Azimuth 45°, Elevation 30°)
const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [NOSE_X + 12, 0, FUSE_Z + 15],
    [TAIL_X - 16, 0, FUSE_Z + 58], // Vertical fin tip
    [0, 68, FUSE_Z],              // Right wingtip
    [0, -68, FUSE_Z],             // Left wingtip
    [DIAL_POS[0], DIAL_POS[1], DIAL_Z + 25]
  ],
  WIDTH,
  HEIGHT,
  { pad: 40, azimuth: 45, elevation: 30 }
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// 1. BASE PLATE & LEVELLING FEET (Anatomy Tooling Bench)
function buildBasePlate() {
  const out = [];

  // Soft depth halo beneath base
  out.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);

  // 4 Knurled levelling feet sorted by isometric depth
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H, 2, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.8, -PLATE_H - FOOT_H + 2, FOOT_H - 2, P, 28), { tone: "mid" }));
    out.push(L(k.knurl(x, y, 5.8, -PLATE_H - FOOT_H + 2, -PLATE_H - FOOT_H + FOOT_H, 24, P), { tone: "faint" }));
  }

  // Heavy beveled base plate
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.8), { tone: "mid" }));

  // Inset tooling groove
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5.5), 0, P), { tone: "lo" }));

  // Corner clamping bolts with countersunk rings
  const bolts = k.corners(PLATE, 9);
  out.push(L(bolts.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(bolts.map(([x, y]) => at([x, y, 0])), { size: 0.5, tone: "mid" }));

  // Calibrated measurement ruler strip on front bevel
  const strip = { x: -95, y: PLATE.y + PLATE.d - 12, w: 190, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.5, P, 2), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.5, [1.8, 3.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.5]), at([strip.x + strip.w - 2, strip.y + 3, 0.5])], { size: 0.45 }));

  // Grounding terminal stud
  const groundX = PLATE.x + 14;
  const groundY = PLATE.y + 14;
  out.push(S(k.cylinder(groundX, groundY, 3.5, 0, 3, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(groundX, groundY, 2.2, 3, 4, P, 18), { tone: "hi" }));
  out.push(L(k.ring(groundX, groundY, 3.5, 3, P, 20), { tone: "hi" }));

  return out.join("");
}

// 2. CRADLE & LAUNCH MOUNT PYLONS
function buildCradle() {
  const out = [];

  // Rear Pylon under wing roots (X = -45)
  for (const y of [-28, 28]) {
    out.push(S(k.slabOf({ x: CRADLE_REAR_X - 6, y: y - 5, w: 12, d: 10, r: 2 }, 0, FUSE_Z - 2, P, 4, 0.8), { tone: "mid" }));
    out.push(S(k.cylinder(CRADLE_REAR_X, y, 3.5, FUSE_Z - 2, 3, P, 20), { tone: "hi" }));
    out.push(D([at([CRADLE_REAR_X, y, FUSE_Z + 1])], { size: 0.5, tone: "lit" }));
  }

  // Cross beam connecting rear pylons
  out.push(S(k.slabOf({ x: CRADLE_REAR_X - 4, y: -26, w: 8, d: 52, r: 1.5 }, FUSE_Z - 7, 5, P, 3, 0.6), { tone: "lo" }));

  // Front Pylon under nose gear / forward fuselage (X = 20)
  out.push(S(k.slabOf({ x: CRADLE_FRONT_X - 6, y: -9, w: 12, d: 18, r: 2.5 }, 0, FUSE_Z - 1, P, 4, 0.8), { tone: "mid" }));
  out.push(S(k.cylinder(CRADLE_FRONT_X, 0, 4.5, FUSE_Z - 1, 3.5, P, 24), { tone: "hi" }));
  out.push(D([at([CRADLE_FRONT_X, 0, FUSE_Z + 2.5])], { size: 0.5, tone: "lit" }));

  // Umbilical Test Conduit running from Base to Rear Fuselage
  const fromPt = at([PLATE.x + 35, PLATE.y + 22, 0]);
  const toPt = at([CRADLE_REAR_X, -16, FUSE_Z + 2]);
  const viaPts = [at([PLATE.x + 35, -20, 4]), at([CRADLE_REAR_X - 10, -25, 12])];
  const conduitWire = k.wireSvg(fromPt, toPt, { via: viaPts, tone: "mid", size: 1.2 });
  out.push(conduitWire);

  return out.join("");
}

// 3. SOVIET BURAN SPACE SHUTTLE (ОК-1К1 «БУРАН»)
function buildBuran() {
  const out = [];

  // A. DOUBLE-DELTA WINGS (Swept Leading Edge + Thermal Tile Underbody)
  const wingPlan = [
    [NOSE_X - 42, 11],     // Forward strake root
    [NOSE_X - 60, 24],     // Mid strake transition
    [TAIL_X + 22, 60],     // Wingtip leading edge
    [TAIL_X + 16, 59],     // Wingtip chord
    [TAIL_X + 6, 55],      // Elevon outer corner
    [TAIL_X + 2, 14],      // Elevon inner hinge at fuselage
    [TAIL_X + 2, -14],     // Left elevon inner hinge
    [TAIL_X + 6, -55],     // Left elevon outer corner
    [TAIL_X + 16, -59],    // Left wingtip chord
    [TAIL_X + 22, -60],    // Left wingtip leading edge
    [NOSE_X - 60, -24],    // Left mid strake transition
    [NOSE_X - 42, -11],    // Left forward strake root
  ];

  // Lower black thermal protection shield
  out.push(S(k.extrude(wingPlan, FUSE_Z - 2.8, 2.8, P, 0.8), { tone: "lo" }));

  // Upper wing structure
  out.push(S(k.extrude(wingPlan, FUSE_Z, 2.2, P, 0.6), { tone: "mid" }));

  // Elevon hinge lines
  const leftHinge = [at([TAIL_X + 14, -56, FUSE_Z + 2.2]), at([TAIL_X + 8, -15, FUSE_Z + 2.2])];
  const rightHinge = [at([TAIL_X + 14, 56, FUSE_Z + 2.2]), at([TAIL_X + 8, 15, FUSE_Z + 2.2])];
  out.push(L(`M ${leftHinge[0][0]} ${leftHinge[0][1]} L ${leftHinge[1][0]} ${leftHinge[1][1]}`, { tone: "hi" }));
  out.push(L(`M ${rightHinge[0][0]} ${rightHinge[0][1]} L ${rightHinge[1][0]} ${rightHinge[1][1]}`, { tone: "hi" }));

  // Cyrillic Wing Markings: "СССР" on Left Wing, "БУРАН" on Right Wing
  const cccpMatrix = k.topMatrix([TAIL_X + 18, -34], FUSE_Z + 2.3, P, "x");
  const buranMatrix = k.topMatrix([TAIL_X + 18, 30], FUSE_Z + 2.3, P, "x");
  out.push(k.faceTextSvg(cccpMatrix, "СССР", { size: 6.5, tone: "hi" }));
  out.push(k.faceTextSvg(buranMatrix, "БУРАН", { size: 6.5, tone: "hi" }));

  // B. MAIN FUSELAGE & CARGO BAY
  const fuseLen = NOSE_X - TAIL_X - 18;
  const fuseBox = { x: TAIL_X + 6, y: -13, w: fuseLen, d: 26, r: 12 };
  out.push(S(k.slabOf(fuseBox, FUSE_Z, 17, P, 8, 2.5), { tone: "mid" }));

  // Segmented Payload Bay Doors
  const bayDoors = { x: TAIL_X + 14, y: -11, w: fuseLen - 26, d: 22, r: 8 };
  out.push(S(k.slabOf(bayDoors, FUSE_Z + 17, 1.2, P, 6, 0.6), { tone: "hi" }));
  // Center door division line (split door seam)
  const seamStart = at([bayDoors.x, 0, FUSE_Z + 18.2]);
  const seamEnd = at([bayDoors.x + bayDoors.w, 0, FUSE_Z + 18.2]);
  out.push(L(`M ${seamStart[0]} ${seamStart[1]} L ${seamEnd[0]} ${seamEnd[1]}`, { tone: "lit" }));

  // Bay door hinge segments
  for (let x = bayDoors.x + 8; x < bayDoors.x + bayDoors.w; x += 14) {
    out.push(D([at([x, -11, FUSE_Z + 17.5]), at([x, 11, FUSE_Z + 17.5])], { size: 0.45, tone: "lo" }));
  }

  // C. NOSE CONE, COCKPIT & RCS NOZZLES
  const cabinBox = { x: NOSE_X - 16, y: -10, w: 16, d: 20, r: 7 };
  out.push(S(k.slabOf(cabinBox, FUSE_Z, 15, P, 6, 2), { tone: "mid" }));

  // Aerodynamic nose cone tip
  const noseTip = { x: NOSE_X, y: -6.5, w: 10, d: 13, r: 5 };
  out.push(S(k.slabOf(noseTip, FUSE_Z + 1, 10, P, 5, 2.5), { tone: "lo" }));

  // Cockpit Glazed Window Frames
  const leftWindow = [at([NOSE_X - 7, -5, FUSE_Z + 12]), at([NOSE_X - 3, -4, FUSE_Z + 11]), at([NOSE_X - 4, -2, FUSE_Z + 12.5])];
  const rightWindow = [at([NOSE_X - 7, 5, FUSE_Z + 12]), at([NOSE_X - 3, 4, FUSE_Z + 11]), at([NOSE_X - 4, 2, FUSE_Z + 12.5])];
  out.push(L(`M ${leftWindow[0][0]} ${leftWindow[0][1]} L ${leftWindow[1][0]} ${leftWindow[1][1]} L ${leftWindow[2][0]} ${leftWindow[2][1]} Z`, { tone: "lit" }));
  out.push(L(`M ${rightWindow[0][0]} ${rightWindow[0][1]} L ${rightWindow[1][0]} ${rightWindow[1][1]} L ${rightWindow[2][0]} ${rightWindow[2][1]} Z`, { tone: "lit" }));

  // Forward RCS Thruster Jets
  const rcsDots = [
    at([NOSE_X + 2, -3.5, FUSE_Z + 8]),
    at([NOSE_X + 4, -3.5, FUSE_Z + 8]),
    at([NOSE_X + 2, 3.5, FUSE_Z + 8]),
    at([NOSE_X + 4, 3.5, FUSE_Z + 8]),
  ];
  out.push(D(rcsDots, { size: 0.5, tone: "lit" }));

  // D. VERTICAL STABILIZER & SPEED BRAKE (Tail Fin)
  const finSlab = { x: TAIL_X - 10, y: -1.8, w: 26, d: 3.6, r: 1.2 };
  out.push(S(k.slabOf(finSlab, FUSE_Z + 14, 38, P, 3, 0.8), { tone: "mid" }));
  const finHingeTop = at([TAIL_X - 6, 0, FUSE_Z + 51]);
  const finHingeBottom = at([TAIL_X + 3, 0, FUSE_Z + 16]);
  out.push(L(`M ${finHingeTop[0]} ${finHingeTop[1]} L ${finHingeBottom[0]} ${finHingeBottom[1]}`, { tone: "hi" }));
  out.push(L(`M ${at([TAIL_X + 15, 0, FUSE_Z + 15])[0]} ${at([TAIL_X + 15, 0, FUSE_Z + 15])[1]} L ${finHingeTop[0]} ${finHingeTop[1]}`, { tone: "lo" }));

  // E. OMS PODS & MAIN CRYOGENIC ENGINES (RD-0120)
  for (const y of [-8, 8]) {
    const omsBox = { x: TAIL_X, y: y - 4, w: 14, d: 8, r: 3 };
    out.push(S(k.slabOf(omsBox, FUSE_Z + 4, 11, P, 3, 0.8), { tone: "mid" }));
    out.push(S(k.cylinder(TAIL_X - 2, y, 2.5, FUSE_Z + 7, 3, P, 16), { tone: "hi" }));
    out.push(D([at([TAIL_X - 5, y, FUSE_Z + 8.5])], { size: 0.5, tone: "lit" }));
  }

  // 3x Aft Cryogenic Main Rocket Engine Mounts
  const engineMounts = [
    [TAIL_X - 2, -6, FUSE_Z + 5],
    [TAIL_X - 2, 6, FUSE_Z + 5],
    [TAIL_X - 2, 0, FUSE_Z + 12]
  ];
  for (const [ex, ey, ez] of engineMounts) {
    out.push(S(k.cylinder(ex, ey, 4.2, ez - 4, 3.5, P, 22), { tone: "lo" }));
    out.push(L(k.ring(ex, ey, 4.2, ez - 0.5, P, 22), { tone: "hi" }));
    out.push(D([at([ex - 2, ey, ez])], { size: 0.6, tone: "lit" }));
  }

  return out.join("");
}

// 4. TELEMETRY DIAL GAUGE (Anatomy Instrument Signature)
function buildDialGauge() {
  const out = [];

  out.push(S(k.cylinder(DIAL_POS[0], DIAL_POS[1], 6.5, 0, 4, P, 24), { tone: "mid" }));
  out.push(S(k.cylinder(DIAL_POS[0], DIAL_POS[1], 3.8, 4, DIAL_Z - 4, P, 20), { tone: "lo" }));
  out.push(S(k.cylinder(DIAL_POS[0], DIAL_POS[1], 5.2, DIAL_Z - 6, 3, P, 22), { tone: "mid" }));
  out.push(L(k.knurl(DIAL_POS[0], DIAL_POS[1], 5.2, DIAL_Z - 6, DIAL_Z - 3, 20, P), { tone: "faint" }));

  // Dial Casing & face
  out.push(S(k.cylinder(DIAL_POS[0], DIAL_POS[1], DIAL_R, DIAL_Z, 6, P, 36), { tone: "mid" }));
  out.push(S(k.cylinder(DIAL_POS[0], DIAL_POS[1], DIAL_R - 1.5, DIAL_Z + 6, 0.6, P, 36), { tone: "hi" }));
  out.push(L(k.ring(DIAL_POS[0], DIAL_POS[1], DIAL_R - 2.2, DIAL_Z + 6.6, P, 32), { tone: "lo" }));

  // Radial measurement ticks around dial face
  const dialTicks = k.radialTicks(DIAL_POS[0], DIAL_POS[1], DIAL_R - 2.8, 24, 4, DIAL_Z + 6.6, [1.4, 2.6], P);
  out.push(L(dialTicks.minor, { tone: "lo" }), L(dialTicks.major, { tone: "mid" }));

  // Dial Pointer Needle
  const centerPt = at([DIAL_POS[0], DIAL_POS[1], DIAL_Z + 6.7]);
  const needleTip = at([DIAL_POS[0] - 8, DIAL_POS[1] - 4, DIAL_Z + 6.7]);
  out.push(L(`M ${centerPt[0]} ${centerPt[1]} L ${needleTip[0]} ${needleTip[1]}`, { tone: "lit" }));
  out.push(D([centerPt], { size: 0.6, tone: "lit" }));

  // Indicator sensor probe extending from gauge to shuttle right elevon
  const probeFrom = at([DIAL_POS[0] - 12, DIAL_POS[1], DIAL_Z + 3]);
  const probeTo = at([TAIL_X + 8, 48, FUSE_Z + 3]);
  const probeVia = [at([DIAL_POS[0] - 25, 45, DIAL_Z + 3])];
  const probeWire = k.wireSvg(probeFrom, probeTo, { via: probeVia, tone: "lit", size: 0.9 });
  out.push(probeWire);

  return out.join("");
}

// 5. ANATOMY OVERLAYS & SUBSYSTEM CALLOUTS (Anatomy Card Layout)
function buildOverlays() {
  const out = [];

  // Corner Plates
  out.push(`
  <g class="iso-overlay" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace">
    <!-- Top-Left Corner -->
    <text x="32" y="36" font-size="11" font-weight="700" fill="#00e5ff" letter-spacing="1.5">No. 51 // OK-1K1 [11F35]</text>
    <text x="32" y="52" font-size="9" fill="#8b949e" letter-spacing="1">SOVIET BURAN TEST BENCH</text>

    <!-- Top-Right Corner -->
    <text x="${WIDTH - 32}" y="36" text-anchor="end" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="1">PRESS AND PULL · ANATOMY RIG</text>
    <text x="${WIDTH - 32}" y="52" text-anchor="end" font-size="9" fill="#ff007c" letter-spacing="1">OPБИТАЛЬНЫЙ КОРАБЛЬ «БУРАН»</text>

    <!-- Bottom-Left Corner -->
    <text x="32" y="${HEIGHT - 44}" font-size="10" fill="#ffea00" letter-spacing="1">AUTONOMOUS ORBITAL FLIGHT // 15.11.1988</text>
    <text x="32" y="${HEIGHT - 28}" font-size="9" fill="#8b949e" letter-spacing="0.5">HELFSTEIN DATA PLATFORM • GTA VI VICE CITY PALETTE</text>

    <!-- Bottom-Right Corner Readout -->
    <text x="${WIDTH - 32}" y="${HEIGHT - 44}" text-anchor="end" font-size="10.5" font-weight="700" fill="#00e5ff" letter-spacing="1">100.0% UNCREWED · MACH 25.0</text>
    <text x="${WIDTH - 32}" y="${HEIGHT - 28}" text-anchor="end" font-size="9" fill="#8b949e">LEAN 0.0 mm · TELEMETRY NOMINAL</text>
  </g>
  `);

  // Callout Leader Lines & Subsystem Badges
  // Callout 1: Cockpit & Autonomous Avionics (Nose)
  const nosePt = at([NOSE_X, 0, FUSE_Z + 10]);
  const c1Text = [WIDTH - 280, 110];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c1Text[0]},${c1Text[1]} ${nosePt[0] + 50},${c1Text[1]} ${nosePt[0]},${nosePt[1]}" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${nosePt[0]}" cy="${nosePt[1]}" r="3.5" fill="#00e5ff"/>
    <rect x="${c1Text[0] - 8}" y="${c1Text[1] - 18}" width="256" height="36" rx="4" fill="#161b22" stroke="#00e5ff" stroke-width="1.2"/>
    <text x="${c1Text[0]}" y="${c1Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#00e5ff">01 // AUTONOMOUS AVIONICS (БИСВ)</text>
    <text x="${c1Text[0]}" y="${c1Text[1] + 10}" font-size="8.5" fill="#ffea00">Python 3.12 · LangGraph · Agent Loops</text>
  </g>
  `);

  // Callout 2: Payload Bay (Cargo & Lakehouse)
  const bayPt = at([0, 0, FUSE_Z + 18]);
  const c2Text = [WIDTH - 280, 205];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c2Text[0]},${c2Text[1]} ${bayPt[0] + 60},${c2Text[1]} ${bayPt[0]},${bayPt[1]}" fill="none" stroke="#ffea00" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${bayPt[0]}" cy="${bayPt[1]}" r="3.5" fill="#ffea00"/>
    <rect x="${c2Text[0] - 8}" y="${c2Text[1] - 18}" width="256" height="36" rx="4" fill="#161b22" stroke="#ffea00" stroke-width="1.2"/>
    <text x="${c2Text[0]}" y="${c2Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#ffea00">02 // MODULAR PAYLOAD BAY (ГРОЗО)</text>
    <text x="${c2Text[0]}" y="${c2Text[1] + 10}" font-size="8.5" fill="#00e5ff">AWS S3 · Delta Lake · Snowflake</text>
  </g>
  `);

  // Callout 3: Wing Thermal Protection & Governance
  const wingPt = at([-10, -50, FUSE_Z]);
  const c3Text = [40, 150];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c3Text[0] + 240},${c3Text[1]} ${wingPt[0] - 40},${c3Text[1]} ${wingPt[0]},${wingPt[1]}" fill="none" stroke="#ff007c" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${wingPt[0]}" cy="${wingPt[1]}" r="3.5" fill="#ff007c"/>
    <rect x="${c3Text[0]}" y="${c3Text[1] - 18}" width="240" height="36" rx="4" fill="#161b22" stroke="#ff007c" stroke-width="1.2"/>
    <text x="${c3Text[0] + 8}" y="${c3Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#ff007c">03 // THERMAL SHIELD (ТЗП)</text>
    <text x="${c3Text[0] + 8}" y="${c3Text[1] + 10}" font-size="8.5" fill="#ffea00">Unity Catalog · Governance · Great Exp</text>
  </g>
  `);

  // Callout 4: Energia Propulsion / Spark Engine
  const enginePt = at([TAIL_X - 4, 0, FUSE_Z + 6]);
  const c4Text = [40, 260];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c4Text[0] + 240},${c4Text[1]} ${enginePt[0] - 50},${c4Text[1]} ${enginePt[0]},${enginePt[1]}" fill="none" stroke="#ff7b00" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${enginePt[0]}" cy="${enginePt[1]}" r="3.5" fill="#ff7b00"/>
    <rect x="${c4Text[0]}" y="${c4Text[1] - 18}" width="240" height="36" rx="4" fill="#161b22" stroke="#ff7b00" stroke-width="1.2"/>
    <text x="${c4Text[0] + 8}" y="${c4Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#ff7b00">04 // ENERGIA CRYOGENIC CLUSTER</text>
    <text x="${c4Text[0] + 8}" y="${c4Text[1] + 10}" font-size="8.5" fill="#00e5ff">Apache Spark · Databricks · Clusters</text>
  </g>
  `);

  // Callout 5: Dial Telemetry Gauge & Observability
  const dialPt = at([DIAL_POS[0], DIAL_POS[1], DIAL_Z + 6]);
  const c5Text = [WIDTH - 280, 470];
  out.push(`
  <g class="iso-callout">
    <polyline points="${c5Text[0]},${c5Text[1]} ${dialPt[0] + 40},${c5Text[1]} ${dialPt[0]},${dialPt[1]}" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-dasharray="4 2"/>
    <circle cx="${dialPt[0]}" cy="${dialPt[1]}" r="3.5" fill="#00e5ff"/>
    <rect x="${c5Text[0] - 8}" y="${c5Text[1] - 18}" width="256" height="36" rx="4" fill="#161b22" stroke="#00e5ff" stroke-width="1.2"/>
    <text x="${c5Text[0]}" y="${c5Text[1] - 4}" font-size="9.5" font-weight="bold" fill="#00e5ff">05 // TELEMETRY DIAL GAUGE</text>
    <text x="${c5Text[0]}" y="${c5Text[1] + 10}" font-size="8.5" fill="#ffea00">OpenTelemetry · Monte Carlo · Drift Audit</text>
  </g>
  `);

  return out.join("");
}

// 6. ASSEMBLE COMPLETE ANATOMY BODY
function buildFigure() {
  const parts = [
    buildBasePlate(),
    buildCradle(),
    buildBuran(),
    buildDialGauge(),
    buildOverlays()
  ];
  return parts.join("\n");
}

// 7. VICE CITY SYNTHWAVE PALETTE CSS (Overrides Anatomy default while keeping exact structure)
const BURAN_VICE_CITY_CSS = `
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
.iso-plate-corner {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
}
`;

// 8. BUILD STANDALONE SVG & HTML
const body = buildFigure();

// Wrap in figureSvg with standalone styling and Vice City CSS
const svgOutput = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Soviet Space Shuttle Buran OK-1K1 Skill Anatomy Test Rig",
  body: `<style>${k.ISO_CSS}\n${BURAN_VICE_CITY_CSS}</style>\n${body}`,
  standalone: "dark"
});

const targetSvgPath = join(HERE, "buran_anatomy.svg");
writeFileSync(targetSvgPath, svgOutput, "utf-8");
console.log(`✓ Generated Buran Anatomy SVG via Anatomy Skill: ${targetSvgPath} (${svgOutput.length} bytes)`);

// Also build full Anatomy Plate HTML with Fig / Title / Hint / Readout / Legend
const plate = k.plateHtml({
  fig: "No. 51 // OK-1K1",
  title: "Soviet Buran Orbital Test Rig (Буран)",
  hint: "Autonomous Orbital Flight · 15.11.1988",
  readout: "100.0% uncrewed · Mach 25.0",
  keys: [
    { mark: "lit", label: "Autonomous AI & Logic (Python/LangGraph)" },
    { mark: "raised", label: "Lakehouse Storage (S3/Delta Lake)" },
    { mark: "flat", label: "Distributed Compute (Spark/Databricks)" },
    { mark: "edge", label: "Orchestration & Governance (Airflow/Unity)" }
  ],
  caption: "Isometric instrument test bench of the Soviet Buran OK-1K1 space shuttle, built with the Anatomy skill geometry engine and Vice City palette.",
  body: svgOutput
});

const page = k.pageHtml({
  title: "Soviet Buran Skill Anatomy // Helfstein Data Platform",
  theme: "dark",
  body: plate,
  width: WIDTH
});

const targetHtmlPath = join(HERE, "buran_anatomy.html");
writeFileSync(targetHtmlPath, page, "utf-8");
console.log(`✓ Generated Buran Anatomy HTML: ${targetHtmlPath} (${page.length} bytes)`);
