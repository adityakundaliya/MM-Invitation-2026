// Flight path for the stamping jet: bottom-left corner -> one clockwise loop -> top-right corner.
//
// The path is three smooth pieces joined with matching headings (so the plane never "snaps"):
//   1. an entry sweep (cubic curve) from just off-screen bottom-left up to the loop,
//   2. the loop itself (heading turns smoothly, so it forms a teardrop that crosses its own tail),
//   3. an exit climb (cubic curve) up and off-screen at the top-right.
// Everything is sampled at an even spacing along the path, so position along the path is
// simply "distance travelled" and the plane / dotted trail can be driven by one number.

export interface FlightPath {
  /** Total path length in px */
  total: number;
  /** Distance between samples in px */
  step: number;
  xs: number[];
  ys: number[];
  /** Direction of travel in radians at each sample (unwrapped, so it never jumps by 2π) */
  angs: number[];
  /** Distance along the path where the stamp is released (lowest point of the loop) */
  dropS: number;
  loopStartS: number;
  loopEndS: number;
}

interface Pt {
  x: number;
  y: number;
}

const DEG = Math.PI / 180;
const TWO_PI = Math.PI * 2;
const SAMPLE_STEP = 4;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Smooth 0 -> 1 ramp (zero slope at both ends)
const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

const dir = (angle: number): Pt => ({ x: Math.cos(angle), y: Math.sin(angle) });
const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    out.push({
      x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
      y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    });
  }
  return out;
}

export function buildFlightPath(W: number, H: number): FlightPath {
  const U = Math.min(W, H);
  const R = clamp(U * 0.16, 62, 175); // average radius of the loop
  const margin = clamp(U * 0.12, 70, 130); // start / end sit this far outside the screen

  const S: Pt = { x: -margin, y: H + margin * 0.6 };
  const E: Pt = { x: W + margin, y: -margin };
  const C: Pt = { x: W * 0.69, y: H * 0.55 }; // where the loop is centred

  // ---- 1. The loop (built around the origin, then moved so its centre sits on C) ----
  const thIn = -22 * DEG; // heading as the plane enters the loop (gently climbing)
  const thOut = -4 * DEG; // heading as it leaves; a bit more than a full turn so the tails cross
  const omega = TWO_PI + (thOut - thIn); // total clockwise turn: a full circle plus a little
  const loopLen = omega * R;
  const loopN = 240;
  const loop: Pt[] = [{ x: 0, y: 0 }];
  for (let i = 1; i <= loopN; i++) {
    const t = (i - 0.5) / loopN;
    const heading = thIn + omega * (0.6 * t + 0.4 * smoothstep(t)); // mostly even turn = round loop
    const prev = loop[i - 1];
    loop.push({
      x: prev.x + Math.cos(heading) * (loopLen / loopN),
      y: prev.y + Math.sin(heading) * (loopLen / loopN),
    });
  }
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of loop) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const shiftX = C.x - (minX + maxX) / 2;
  const shiftY = C.y - (minY + maxY) / 2;
  for (const p of loop) {
    p.x += shiftX;
    p.y += shiftY;
  }
  const loopStart = loop[0];
  const loopEnd = loop[loop.length - 1];

  // ---- 2. Entry sweep: off-screen bottom-left -> start of the loop ----
  const entryChord = Math.atan2(loopStart.y - S.y, loopStart.x - S.x);
  const entryLen = dist(S, loopStart);
  const thStart = entryChord + 20 * DEG; // leaves the corner flatter than the straight line
  const entry = cubic(
    S,
    { x: S.x + dir(thStart).x * entryLen * 0.36, y: S.y + dir(thStart).y * entryLen * 0.36 },
    { x: loopStart.x - dir(thIn).x * entryLen * 0.34, y: loopStart.y - dir(thIn).y * entryLen * 0.34 },
    loopStart,
    120,
  );

  // ---- 3. Exit climb: end of the loop -> off-screen top-right ----
  const exitChord = Math.atan2(E.y - loopEnd.y, E.x - loopEnd.x);
  const exitLen = dist(loopEnd, E);
  const thEnd = exitChord + 6 * DEG;
  const exit = cubic(
    loopEnd,
    { x: loopEnd.x + dir(thOut).x * exitLen * 0.34, y: loopEnd.y + dir(thOut).y * exitLen * 0.34 },
    { x: E.x - dir(thEnd).x * exitLen * 0.3, y: E.y - dir(thEnd).y * exitLen * 0.3 },
    E,
    120,
  );

  // ---- Join and resample at an even spacing ----
  const dense: Pt[] = [...entry, ...loop.slice(1), ...exit.slice(1)];
  const cum: number[] = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + dist(dense[i - 1], dense[i]));
  const total = cum[cum.length - 1];
  const entryEndLen = cum[entry.length - 1];
  const loopEndLen = cum[entry.length - 1 + loop.length - 1];

  const count = Math.floor(total / SAMPLE_STEP) + 1;
  const xs: number[] = [];
  const ys: number[] = [];
  let j = 0;
  for (let i = 0; i < count; i++) {
    const s = Math.min(i * SAMPLE_STEP, total);
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const seg = cum[j + 1] - cum[j] || 1;
    const f = (s - cum[j]) / seg;
    xs.push(dense[j].x + (dense[j + 1].x - dense[j].x) * f);
    ys.push(dense[j].y + (dense[j + 1].y - dense[j].y) * f);
  }

  // Direction of travel at every sample (looked at over a short window so it is smooth)
  const angs: number[] = [];
  const w = 2;
  for (let i = 0; i < count; i++) {
    const a = Math.max(0, i - w);
    const b = Math.min(count - 1, i + w);
    let ang = Math.atan2(ys[b] - ys[a], xs[b] - xs[a]);
    if (i > 0) {
      while (ang - angs[i - 1] > Math.PI) ang -= TWO_PI;
      while (ang - angs[i - 1] < -Math.PI) ang += TWO_PI;
    }
    angs.push(ang);
  }

  // The stamp is released at the lowest point of the loop
  const loopFirst = Math.ceil(entryEndLen / SAMPLE_STEP);
  const loopLast = Math.min(count - 1, Math.floor(loopEndLen / SAMPLE_STEP));
  let dropIdx = loopFirst;
  for (let i = loopFirst; i <= loopLast; i++) {
    if (ys[i] > ys[dropIdx]) dropIdx = i;
  }

  return {
    total,
    step: SAMPLE_STEP,
    xs,
    ys,
    angs,
    dropS: dropIdx * SAMPLE_STEP,
    loopStartS: entryEndLen,
    loopEndS: loopEndLen,
  };
}
