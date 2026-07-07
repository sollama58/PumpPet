import { useMemo } from 'react'
import type { PetState } from '../../types'
import './pet.css'

// ── Palette ──────────────────────────────────────────────────────────────────
const BG   = '#2d1200'   // room wall
const FLR  = '#160800'   // floor
const TBL  = '#7b4a2f'   // table top
const TLEG = '#5a2e0f'   // table legs
const DOG  = '#e8a84a'   // dog tan
const DOGD = '#c8823a'   // dog dark-tan (ears, snout)
const INK  = '#1a0800'   // dark outline / nose / eyes
const COL  = '#cc2222'   // collar red
const BEL  = '#ffcc00'   // collar bell yellow
const CUP  = '#c8923a'   // cup body
const CUPR = '#daa840'   // cup rim
const STM  = '#888888'   // steam
const TEAR = '#88ccff'   // tear blue
const PINK = '#ff3399'   // party hat
const HAT_Y= '#ffcc00'   // hat trim / star
const TEETH= '#fffac8'   // open-mouth inside

const FIRES: Record<PetState, [string, string]> = {
  neutral:  ['#ff6600', '#ffcc00'],
  happy:    ['#ff8800', '#ffee44'],
  ecstatic: ['#ffcc00', '#44ffcc'],
  worried:  ['#cc4400', '#ff9922'],
  sad:      ['#bb2200', '#ff6600'],
  rugged:   ['#880000', '#cc2200'],
}

// ── Grid helpers ─────────────────────────────────────────────────────────────
type G = string[][]

function make(): G {
  return Array.from({ length: 64 }, () => Array(64).fill(BG))
}

function px(g: G, x: number, y: number, c: string) {
  if (y >= 0 && y < 64 && x >= 0 && x < 64) g[y][x] = c
}

function rect(g: G, x: number, y: number, w: number, h: number, c: string) {
  for (let r = y; r < y + h; r++)
    for (let col = x; col < x + w; col++)
      px(g, col, r, c)
}

function ell(g: G, cx: number, cy: number, rx: number, ry: number, c: string) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry
      if (nx * nx + ny * ny <= 1) px(g, x, y, c)
    }
}

// Tilted ellipse (for floppy ears)
function tell(g: G, cx: number, cy: number, rx: number, ry: number, ang: number, c: string) {
  const cos = Math.cos(ang), sin = Math.sin(ang)
  const bound = Math.ceil(Math.max(rx, ry) * 1.5)
  for (let y = cy - bound; y <= cy + bound; y++)
    for (let x = cx - bound; x <= cx + bound; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy
      const tx = dx * cos + dy * sin, ty = -dx * sin + dy * cos
      if ((tx / rx) ** 2 + (ty / ry) ** 2 <= 1) px(g, x, y, c)
    }
}

// ── Eyes ─────────────────────────────────────────────────────────────────────
function drawEyes(g: G, state: PetState) {
  // left eye ~(15,18), right eye ~(27,18)
  const lx = 15, rx = 27, ey = 18

  if (state === 'happy' || state === 'ecstatic') {
    // happy squint — upward arc ^
    px(g, lx - 2, ey + 1, INK); px(g, lx - 1, ey, INK); px(g, lx, ey - 1, INK)
    px(g, lx + 1, ey, INK);     px(g, lx + 2, ey + 1, INK)
    px(g, rx - 2, ey + 1, INK); px(g, rx - 1, ey, INK); px(g, rx, ey - 1, INK)
    px(g, rx + 1, ey, INK);     px(g, rx + 2, ey + 1, INK)
  } else if (state === 'rugged') {
    // X eyes
    for (const [ox, oy] of [[-1, -1], [0, 0], [1, 1], [-1, 1], [1, -1]]) {
      px(g, lx + ox, ey + oy, INK)
      px(g, rx + ox, ey + oy, INK)
    }
  } else if (state === 'sad') {
    // droopy half-circle — bottom of arc
    px(g, lx - 1, ey - 1, INK); px(g, lx, ey, INK); px(g, lx + 1, ey - 1, INK)
    px(g, lx - 2, ey, INK);     px(g, lx + 2, ey, INK)
    px(g, rx - 1, ey - 1, INK); px(g, rx, ey, INK); px(g, rx + 1, ey - 1, INK)
    px(g, rx - 2, ey, INK);     px(g, rx + 2, ey, INK)
  } else {
    // neutral / worried — solid dot with white highlight
    rect(g, lx - 1, ey - 1, 3, 3, INK)
    rect(g, rx - 1, ey - 1, 3, 3, INK)
    px(g, lx, ey - 1, '#ffffff')
    px(g, rx, ey - 1, '#ffffff')
  }
}

// ── Mouth ─────────────────────────────────────────────────────────────────────
function drawMouth(g: G, state: PetState) {
  // centred around (22, 33) — bottom of snout
  if (state === 'neutral') {
    // gentle flat smile
    px(g, 17, 33, INK); px(g, 18, 34, INK)
    for (let x = 19; x <= 25; x++) px(g, x, 34, INK)
    px(g, 26, 33, INK)
  } else if (state === 'happy') {
    // U-shape smile
    px(g, 16, 32, INK); px(g, 17, 33, INK); px(g, 18, 34, INK)
    px(g, 19, 35, INK); px(g, 20, 35, INK); px(g, 21, 35, INK)
    px(g, 22, 35, INK); px(g, 23, 35, INK); px(g, 24, 34, INK)
    px(g, 25, 33, INK); px(g, 26, 32, INK)
  } else if (state === 'ecstatic') {
    // wide grin with teeth
    px(g, 14, 31, INK); px(g, 15, 32, INK)
    for (let x = 15; x <= 29; x++) px(g, x, 33, INK)
    for (let x = 16; x <= 28; x++) px(g, x, 34, TEETH)
    for (let x = 16; x <= 28; x++) px(g, x, 35, INK)
    px(g, 29, 34, INK); px(g, 30, 33, INK); px(g, 31, 32, INK)
  } else if (state === 'worried') {
    // slight downturn
    px(g, 17, 34, INK); px(g, 18, 35, INK)
    for (let x = 19; x <= 25; x++) px(g, x, 35, INK)
    px(g, 26, 35, INK); px(g, 27, 34, INK)
  } else if (state === 'sad') {
    // clear frown
    px(g, 16, 36, INK); px(g, 17, 35, INK); px(g, 18, 34, INK)
    px(g, 19, 33, INK); px(g, 20, 33, INK); px(g, 21, 32, INK)
    px(g, 22, 32, INK); px(g, 23, 33, INK); px(g, 24, 33, INK)
    px(g, 25, 34, INK); px(g, 26, 35, INK); px(g, 27, 36, INK)
  } else {
    // rugged — wavy distressed frown
    px(g, 14, 35, INK); px(g, 15, 36, INK); px(g, 16, 35, INK)
    px(g, 17, 36, INK); px(g, 18, 35, INK); px(g, 19, 34, INK)
    px(g, 20, 33, INK); px(g, 21, 33, INK); px(g, 22, 32, INK)
    px(g, 23, 33, INK); px(g, 24, 34, INK); px(g, 25, 35, INK)
    px(g, 26, 36, INK)
  }
}

// ── Full scene builder ────────────────────────────────────────────────────────
function buildGrid(state: PetState): G {
  const g = make()
  const [fb, ft] = FIRES[state]

  // Floor
  rect(g, 0, 45, 64, 19, FLR)

  // Left fire
  ell(g, 6, 32, 5, 13, ft)
  ell(g, 6, 39, 4, 7, fb)

  // Right fire
  ell(g, 58, 30, 6, 15, ft)
  ell(g, 58, 38, 5, 9, fb)

  // Table surface
  rect(g, 8, 41, 48, 4, TBL)
  // Table legs
  rect(g, 10, 45, 4, 16, TLEG)
  rect(g, 50, 45, 4, 16, TLEG)

  // Cup body
  rect(g, 42, 33, 7, 8, CUP)
  // Cup rim
  rect(g, 41, 31, 9, 3, CUPR)
  // Handle
  px(g, 49, 35, CUP); px(g, 49, 36, CUP); px(g, 49, 37, CUP); px(g, 49, 38, CUP)
  px(g, 50, 36, CUP); px(g, 50, 37, CUP)

  // Steam (only for non-sad states)
  if (state !== 'sad' && state !== 'rugged') {
    px(g, 44, 29, STM); px(g, 43, 28, STM); px(g, 44, 27, STM); px(g, 43, 26, STM)
    px(g, 46, 29, STM); px(g, 47, 28, STM); px(g, 46, 27, STM); px(g, 47, 26, STM)
  }

  // ── Dog ──────────────────────────────────────────────────────────────────

  // Body
  ell(g, 24, 38, 12, 6, DOG)

  // Tail (static)
  px(g, 36, 37, DOG); px(g, 37, 36, DOG); px(g, 37, 35, DOG)
  px(g, 38, 34, DOG); px(g, 38, 33, DOGD); px(g, 39, 32, DOGD); px(g, 39, 31, DOGD)

  // Left ear (floppy, tilted)
  tell(g, 13, 22, 4, 9, 0.28, DOGD)
  // Right ear (floppy, tilted other way)
  tell(g, 35, 20, 4, 8, -0.28, DOGD)

  // Head (drawn after ears so it overlaps them at the top)
  ell(g, 23, 22, 11, 11, DOG)

  // Snout (slightly darker oval)
  ell(g, 22, 29, 8, 6, DOGD)

  // Nose
  ell(g, 20, 25, 3, 2, INK)

  // Eyes
  drawEyes(g, state)

  // Eyebrows (worried / sad / rugged)
  if (state === 'worried' || state === 'sad' || state === 'rugged') {
    px(g, 13, 14, INK); px(g, 14, 13, INK); px(g, 15, 13, INK); px(g, 16, 14, INK)
    px(g, 25, 14, INK); px(g, 26, 13, INK); px(g, 27, 13, INK); px(g, 28, 14, INK)
  }

  // Mouth
  drawMouth(g, state)

  // Collar
  rect(g, 13, 32, 22, 3, COL)
  // Bell
  rect(g, 22, 31, 4, 5, BEL)

  // Paws (on table)
  ell(g, 15, 43, 5, 3, DOG)
  ell(g, 30, 43, 5, 3, DOG)

  // Party hat (ecstatic)
  if (state === 'ecstatic') {
    for (let y = 7; y <= 14; y++) {
      const hw = Math.round((14 - y) * 0.9 + 0.5)
      for (let x = 23 - hw; x <= 23 + hw; x++) px(g, x, y, PINK)
    }
    rect(g, 16, 14, 15, 2, HAT_Y)
    px(g, 23, 6, HAT_Y); px(g, 22, 7, HAT_Y); px(g, 24, 7, HAT_Y)
  }

  // Extra table fire (rugged)
  if (state === 'rugged') {
    ell(g, 34, 40, 8, 4, fb)
    ell(g, 34, 37, 5, 3, ft)
  }

  return g
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props { state: PetState }

export function PetSVG({ state }: Props) {
  const grid = useMemo(() => buildGrid(state), [state])
  const [fb, ft] = FIRES[state]
  const showTears    = state === 'sad'      || state === 'rugged'
  const showConfetti = state === 'ecstatic'
  const showSkulls   = state === 'rugged'

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className="w-full max-w-sm mx-auto select-none"
      aria-label={`Dog feeling ${state}`}
    >
      {/* ── Pixel grid ──────────────────────────────────────────────────── */}
      {grid.flatMap((row, y) =>
        row.map((color, x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
        ))
      )}

      {/* ── Animated fire overlay (glowing flicker on top of pixel fire) ── */}
      <g className="pet-fire" style={{ transformOrigin: '6px 39px' }}>
        <ellipse cx="6" cy="34" rx="5" ry="12" fill={ft} opacity="0.3" />
      </g>
      <g className="pet-fire" style={{ transformOrigin: '58px 38px', animationDelay: '0.25s' }}>
        <ellipse cx="58" cy="32" rx="6" ry="14" fill={ft} opacity="0.3" />
      </g>
      {state === 'rugged' && (
        <g className="pet-fire" style={{ transformOrigin: '34px 40px', animationDelay: '0.1s' }}>
          <ellipse cx="34" cy="39" rx="7" ry="4" fill={ft} opacity="0.4" />
        </g>
      )}

      {/* ── Tears ───────────────────────────────────────────────────────── */}
      {showTears && (
        <>
          <ellipse cx="13" cy="23" rx="1" ry="1.5" fill={TEAR} className="pet-tear" style={{ animationDelay: '0s' }} />
          <ellipse cx="28" cy="23" rx="1" ry="1.5" fill={TEAR} className="pet-tear" style={{ animationDelay: '0.45s' }} />
          <ellipse cx="13" cy="27" rx="1" ry="1.5" fill={TEAR} className="pet-tear" style={{ animationDelay: '0.9s' }} />
          <ellipse cx="28" cy="27" rx="1" ry="1.5" fill={TEAR} className="pet-tear" style={{ animationDelay: '1.35s' }} />
        </>
      )}

      {/* ── Confetti ────────────────────────────────────────────────────── */}
      {showConfetti && (
        [['#ff3399', 4, 10], ['#00ffcc', 54, 8], ['#ffcc00', 59, 14],
         ['#ff6600', 2, 18], ['#aa00ff', 57, 6], ['#00aaff', 6, 6]].map(([color, x, y], i) => (
          <rect
            key={i} x={Number(x)} y={Number(y)} width={2} height={2}
            fill={color as string}
            className="pet-confetti"
            style={{ animationDelay: `${i * 0.12}s`, animationIterationCount: 'infinite' }}
          />
        ))
      )}

      {/* ── Skull particles ─────────────────────────────────────────────── */}
      {showSkulls && (
        [[18, 12, '0s'], [44, 7, '0.5s'], [56, 14, '1s']].map(([x, y, delay], i) => (
          <text
            key={i} x={Number(x)} y={Number(y)}
            fontSize="7" className="pet-skull"
            style={{ animationDelay: delay as string, animationIterationCount: 'infinite' }}
          >
            💀
          </text>
        ))
      )}

      {/* ── Speech bubble (smooth SVG, upper-right) ─────────────────────── */}
      <rect x="33" y="1" width="30" height="14" fill="white" rx="2" />
      <polygon points="36,15 39,20 43,15" fill="white" />
      <text fontFamily="'Comic Neue',cursive,monospace" fontWeight="bold" fill="#1a0800">
        {state === 'neutral'  && <><tspan x="35" y="8" fontSize="3">This is</tspan><tspan x="35" dy="4" fontSize="3">fine.</tspan></>}
        {state === 'happy'    && <><tspan x="35" y="8" fontSize="3">I&apos;m profit-</tspan><tspan x="35" dy="4" fontSize="3">able! :)</tspan></>}
        {state === 'ecstatic' && <><tspan x="35" y="8" fontSize="3">WE ARE</tspan><tspan x="35" dy="4" fontSize="3">SO BACK</tspan></>}
        {state === 'worried'  && <><tspan x="35" y="8" fontSize="3">This is...</tspan><tspan x="35" dy="4" fontSize="3">fine?</tspan></>}
        {state === 'sad'      && <><tspan x="35" y="8" fontSize="3">This is</tspan><tspan x="35" dy="4" fontSize="3">NOT fine.</tspan></>}
        {state === 'rugged'   && <><tspan x="35" y="8" fontSize="3">I have</tspan><tspan x="35" dy="4" fontSize="3">no bags.</tspan></>}
      </text>
    </svg>
  )
}
