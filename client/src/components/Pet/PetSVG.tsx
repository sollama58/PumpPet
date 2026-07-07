import { useMemo } from 'react'
import type { PetState } from '../../types'
import './pet.css'

// ── Palette ──────────────────────────────────────────────────────────────────
const BG   = '#2d1200'
const FLR  = '#160800'
const TBL  = '#7b4a2f'
const TLEG = '#5a2e0f'
const DOG  = '#e8a84a'
const DOGD = '#c8823a'
const INK  = '#1a0800'
const COL  = '#cc2222'
const BEL  = '#ffcc00'
const CUP  = '#c8923a'
const CUPR = '#daa840'
const STM  = '#888888'
const TEAR = '#88ccff'
const PINK = '#ff3399'
const HAT_Y= '#ffcc00'
const TEETH= '#fffac8'

const FIRES: Record<PetState, [string, string]> = {
  neutral:  ['#ff6600', '#ffcc00'],
  happy:    ['#ff8800', '#ffee44'],
  ecstatic: ['#ffcc00', '#44ffcc'],
  worried:  ['#cc4400', '#ff9922'],
  sad:      ['#bb2200', '#ff6600'],
  rugged:   ['#880000', '#cc2200'],
}

// ── Grid helpers — all logical coords are in 64-unit space; SCALE=2 doubles
//    them to fill the 128×128 canvas ─────────────────────────────────────────
const SZ    = 128
const SCALE = 2

type G = string[][]

function make(): G {
  return Array.from({ length: SZ }, () => Array(SZ).fill(BG))
}

// Each logical "pixel" becomes a SCALE×SCALE block
function px(g: G, x: number, y: number, c: string) {
  const sx = x * SCALE, sy = y * SCALE
  for (let dy = 0; dy < SCALE; dy++)
    for (let dx = 0; dx < SCALE; dx++) {
      const gy = sy + dy, gx = sx + dx
      if (gy >= 0 && gy < SZ && gx >= 0 && gx < SZ) g[gy][gx] = c
    }
}

function rect(g: G, x: number, y: number, w: number, h: number, c: string) {
  for (let r = y * SCALE; r < (y + h) * SCALE; r++)
    for (let col = x * SCALE; col < (x + w) * SCALE; col++)
      if (r >= 0 && r < SZ && col >= 0 && col < SZ) g[r][col] = c
}

function ell(g: G, cx: number, cy: number, rx: number, ry: number, c: string) {
  const scx = cx * SCALE, scy = cy * SCALE
  const srx = rx * SCALE, sry = ry * SCALE
  for (let y = Math.floor(scy - sry); y <= Math.ceil(scy + sry); y++)
    for (let x = Math.floor(scx - srx); x <= Math.ceil(scx + srx); x++) {
      const nx = (x + 0.5 - scx) / srx, ny = (y + 0.5 - scy) / sry
      if (nx * nx + ny * ny <= 1 && y >= 0 && y < SZ && x >= 0 && x < SZ)
        g[y][x] = c
    }
}

function tell(g: G, cx: number, cy: number, rx: number, ry: number, ang: number, c: string) {
  const cos = Math.cos(ang), sin = Math.sin(ang)
  const scx = cx * SCALE, scy = cy * SCALE
  const srx = rx * SCALE, sry = ry * SCALE
  const bound = Math.ceil(Math.max(srx, sry) * 1.5)
  for (let y = scy - bound; y <= scy + bound; y++)
    for (let x = scx - bound; x <= scx + bound; x++) {
      const dx = x + 0.5 - scx, dy = y + 0.5 - scy
      const tx = dx * cos + dy * sin, ty = -dx * sin + dy * cos
      if ((tx / srx) ** 2 + (ty / sry) ** 2 <= 1 && y >= 0 && y < SZ && x >= 0 && x < SZ)
        g[y][x] = c
    }
}

// ── Eyes (logical 64-unit coords; px() scales to 128) ────────────────────────
function drawEyes(g: G, state: PetState) {
  const lx = 15, rx = 27, ey = 18

  if (state === 'happy' || state === 'ecstatic') {
    px(g, lx - 2, ey + 1, INK); px(g, lx - 1, ey, INK); px(g, lx, ey - 1, INK)
    px(g, lx + 1, ey, INK);     px(g, lx + 2, ey + 1, INK)
    px(g, rx - 2, ey + 1, INK); px(g, rx - 1, ey, INK); px(g, rx, ey - 1, INK)
    px(g, rx + 1, ey, INK);     px(g, rx + 2, ey + 1, INK)
  } else if (state === 'rugged') {
    for (const [ox, oy] of [[-1, -1], [0, 0], [1, 1], [-1, 1], [1, -1]]) {
      px(g, lx + ox, ey + oy, INK)
      px(g, rx + ox, ey + oy, INK)
    }
  } else if (state === 'sad') {
    px(g, lx - 1, ey - 1, INK); px(g, lx, ey, INK); px(g, lx + 1, ey - 1, INK)
    px(g, lx - 2, ey, INK);     px(g, lx + 2, ey, INK)
    px(g, rx - 1, ey - 1, INK); px(g, rx, ey, INK); px(g, rx + 1, ey - 1, INK)
    px(g, rx - 2, ey, INK);     px(g, rx + 2, ey, INK)
  } else {
    rect(g, lx - 1, ey - 1, 3, 3, INK)
    rect(g, rx - 1, ey - 1, 3, 3, INK)
    px(g, lx, ey - 1, '#ffffff')
    px(g, rx, ey - 1, '#ffffff')
  }
}

// ── Mouth (logical 64-unit coords) ───────────────────────────────────────────
function drawMouth(g: G, state: PetState) {
  if (state === 'neutral') {
    px(g, 17, 33, INK); px(g, 18, 34, INK)
    for (let x = 19; x <= 25; x++) px(g, x, 34, INK)
    px(g, 26, 33, INK)
  } else if (state === 'happy') {
    px(g, 16, 32, INK); px(g, 17, 33, INK); px(g, 18, 34, INK)
    px(g, 19, 35, INK); px(g, 20, 35, INK); px(g, 21, 35, INK)
    px(g, 22, 35, INK); px(g, 23, 35, INK); px(g, 24, 34, INK)
    px(g, 25, 33, INK); px(g, 26, 32, INK)
  } else if (state === 'ecstatic') {
    px(g, 14, 31, INK); px(g, 15, 32, INK)
    for (let x = 15; x <= 29; x++) px(g, x, 33, INK)
    for (let x = 16; x <= 28; x++) px(g, x, 34, TEETH)
    for (let x = 16; x <= 28; x++) px(g, x, 35, INK)
    px(g, 29, 34, INK); px(g, 30, 33, INK); px(g, 31, 32, INK)
  } else if (state === 'worried') {
    px(g, 17, 34, INK); px(g, 18, 35, INK)
    for (let x = 19; x <= 25; x++) px(g, x, 35, INK)
    px(g, 26, 35, INK); px(g, 27, 34, INK)
  } else if (state === 'sad') {
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

// ── Full scene (logical 64-unit coords throughout) ────────────────────────────
function buildGrid(state: PetState): G {
  const g = make()
  const [fb, ft] = FIRES[state]

  rect(g, 0, 45, 64, 19, FLR)

  ell(g, 6, 32, 5, 13, ft);  ell(g, 6, 39, 4, 7, fb)
  ell(g, 58, 30, 6, 15, ft); ell(g, 58, 38, 5, 9, fb)

  rect(g, 8, 41, 48, 4, TBL)
  rect(g, 10, 45, 4, 16, TLEG)
  rect(g, 50, 45, 4, 16, TLEG)

  rect(g, 42, 33, 7, 8, CUP)
  rect(g, 41, 31, 9, 3, CUPR)
  px(g, 49, 35, CUP); px(g, 49, 36, CUP); px(g, 49, 37, CUP); px(g, 49, 38, CUP)
  px(g, 50, 36, CUP); px(g, 50, 37, CUP)

  if (state !== 'sad' && state !== 'rugged') {
    px(g, 44, 29, STM); px(g, 43, 28, STM); px(g, 44, 27, STM); px(g, 43, 26, STM)
    px(g, 46, 29, STM); px(g, 47, 28, STM); px(g, 46, 27, STM); px(g, 47, 26, STM)
  }

  ell(g, 24, 38, 12, 6, DOG)

  px(g, 36, 37, DOG); px(g, 37, 36, DOG); px(g, 37, 35, DOG)
  px(g, 38, 34, DOG); px(g, 38, 33, DOGD); px(g, 39, 32, DOGD); px(g, 39, 31, DOGD)

  tell(g, 13, 22, 4, 9,  0.28, DOGD)
  tell(g, 35, 20, 4, 8, -0.28, DOGD)
  ell(g, 23, 22, 11, 11, DOG)
  ell(g, 22, 29, 8, 6, DOGD)
  ell(g, 20, 25, 3, 2, INK)

  drawEyes(g, state)

  if (state === 'worried' || state === 'sad' || state === 'rugged') {
    px(g, 13, 14, INK); px(g, 14, 13, INK); px(g, 15, 13, INK); px(g, 16, 14, INK)
    px(g, 25, 14, INK); px(g, 26, 13, INK); px(g, 27, 13, INK); px(g, 28, 14, INK)
  }

  drawMouth(g, state)

  rect(g, 13, 32, 22, 3, COL)
  rect(g, 22, 31, 4, 5, BEL)

  ell(g, 15, 43, 5, 3, DOG)
  ell(g, 30, 43, 5, 3, DOG)

  if (state === 'ecstatic') {
    for (let y = 7; y <= 14; y++) {
      const hw = Math.round((14 - y) * 0.9 + 0.5)
      for (let x = 23 - hw; x <= 23 + hw; x++) px(g, x, y, PINK)
    }
    rect(g, 16, 14, 15, 2, HAT_Y)
    px(g, 23, 6, HAT_Y); px(g, 22, 7, HAT_Y); px(g, 24, 7, HAT_Y)
  }

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
      viewBox={`0 0 ${SZ} ${SZ}`}
      width={1028}
      height={1028}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
      aria-label={`Dog feeling ${state}`}
    >
      {/* ── Pixel grid ──────────────────────────────────────────────────── */}
      {grid.flatMap((row, y) =>
        row.map((color, x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
        ))
      )}

      {/* ── Animated fire overlay ───────────────────────────────────────── */}
      <g className="pet-fire" style={{ transformOrigin: '12px 78px' }}>
        <ellipse cx="12" cy="68" rx="10" ry="26" fill={ft} opacity="0.3" />
      </g>
      <g className="pet-fire" style={{ transformOrigin: '116px 76px', animationDelay: '0.25s' }}>
        <ellipse cx="116" cy="64" rx="12" ry="28" fill={ft} opacity="0.3" />
      </g>
      {state === 'rugged' && (
        <g className="pet-fire" style={{ transformOrigin: '68px 80px', animationDelay: '0.1s' }}>
          <ellipse cx="68" cy="78" rx="16" ry="8" fill={ft} opacity="0.4" />
        </g>
      )}

      {/* ── Tears ───────────────────────────────────────────────────────── */}
      {showTears && (
        <>
          <ellipse cx="28" cy="44" rx="2" ry="3" fill={TEAR} className="pet-tear" style={{ animationDelay: '0s' }} />
          <ellipse cx="52" cy="44" rx="2" ry="3" fill={TEAR} className="pet-tear" style={{ animationDelay: '0.45s' }} />
          <ellipse cx="28" cy="52" rx="2" ry="3" fill={TEAR} className="pet-tear" style={{ animationDelay: '0.9s' }} />
          <ellipse cx="52" cy="52" rx="2" ry="3" fill={TEAR} className="pet-tear" style={{ animationDelay: '1.35s' }} />
        </>
      )}

      {/* ── Confetti ────────────────────────────────────────────────────── */}
      {showConfetti && (
        [['#ff3399', 8, 20], ['#00ffcc', 108, 16], ['#ffcc00', 118, 28],
         ['#ff6600', 4, 36], ['#aa00ff', 114, 12], ['#00aaff', 12, 12]].map(([color, x, y], i) => (
          <rect
            key={i} x={Number(x)} y={Number(y)} width={4} height={4}
            fill={color as string}
            className="pet-confetti"
            style={{ animationDelay: `${i * 0.12}s`, animationIterationCount: 'infinite' }}
          />
        ))
      )}

      {/* ── Skull particles ─────────────────────────────────────────────── */}
      {showSkulls && (
        [[36, 24, '0s'], [88, 14, '0.5s'], [112, 28, '1s']].map(([x, y, delay], i) => (
          <text
            key={i} x={Number(x)} y={Number(y)}
            fontSize="14" className="pet-skull"
            style={{ animationDelay: delay as string, animationIterationCount: 'infinite' }}
          >
            💀
          </text>
        ))
      )}

      {/* ── Speech bubble (upper-right) ─────────────────────────────────── */}
      <rect x="66" y="2" width="60" height="28" fill="white" rx="4" />
      <polygon points="72,30 78,40 86,30" fill="white" />
      <text fontFamily="'Comic Neue',cursive,monospace" fontWeight="bold" fill="#1a0800">
        {state === 'neutral'  && <><tspan x="70" y="16" fontSize="6">This is</tspan><tspan x="70" dy="8" fontSize="6">fine.</tspan></>}
        {state === 'happy'    && <><tspan x="70" y="16" fontSize="6">I&apos;m profit-</tspan><tspan x="70" dy="8" fontSize="6">able! :)</tspan></>}
        {state === 'ecstatic' && <><tspan x="70" y="16" fontSize="6">WE ARE</tspan><tspan x="70" dy="8" fontSize="6">SO BACK</tspan></>}
        {state === 'worried'  && <><tspan x="70" y="16" fontSize="6">This is...</tspan><tspan x="70" dy="8" fontSize="6">fine?</tspan></>}
        {state === 'sad'      && <><tspan x="70" y="16" fontSize="6">This is</tspan><tspan x="70" dy="8" fontSize="6">NOT fine.</tspan></>}
        {state === 'rugged'   && <><tspan x="70" y="16" fontSize="6">I have</tspan><tspan x="70" dy="8" fontSize="6">no bags.</tspan></>}
      </text>
    </svg>
  )
}
