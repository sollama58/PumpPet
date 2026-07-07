import type { PetState } from '../../types'
import './pet.css'

interface Props {
  state: PetState
}

const FIRE_COLORS: Record<PetState, [string, string]> = {
  neutral:  ['#ff6b00', '#ffd700'],
  happy:    ['#ff8c00', '#ffe44d'],
  ecstatic: ['#ff0', '#00ffcc'],
  worried:  ['#cc4400', '#ff9922'],
  sad:      ['#bb2200', '#ff6600'],
  rugged:   ['#880000', '#cc2200'],
}

const EYE_EXPR: Record<PetState, string> = {
  neutral:  'M0,4 Q4,0 8,4',
  happy:    'M0,4 Q4,0 8,4',
  ecstatic: 'M0,4 Q4,-2 8,4',
  worried:  'M0,2 Q4,6 8,2',
  sad:      'M0,0 Q4,5 8,0',
  rugged:   'M0,0 Q4,6 8,0',
}

const MOUTH_EXPR: Record<PetState, string> = {
  neutral:  'M4,0 Q8,2 12,0',
  happy:    'M2,0 Q7,5 12,0',
  ecstatic: 'M1,0 Q6,8 11,0',
  worried:  'M2,2 Q7,-2 12,2',
  sad:      'M2,4 Q7,-4 12,4',
  rugged:   'M1,5 Q6,-5 11,5',
}

export function PetSVG({ state }: Props) {
  const [fireBase, fireTip] = FIRE_COLORS[state]
  const eyePath = EYE_EXPR[state]
  const mouthPath = MOUTH_EXPR[state]
  const wagClass = (state === 'happy' || state === 'ecstatic') ? 'pet-tail-wag' : ''
  const showTears = state === 'sad' || state === 'rugged'
  const showConfetti = state === 'ecstatic'
  const showSkulls = state === 'rugged'
  const isLyingDown = state === 'rugged'

  return (
    <svg
      viewBox="0 0 320 280"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto select-none"
      aria-label={`Dog feeling ${state}`}
    >
      {/* Room background */}
      <rect x="0" y="0" width="320" height="280" fill="#3a1a00" rx="8" />
      <rect x="0" y="180" width="320" height="100" fill="#2a1000" />

      {/* Wall fire (background) */}
      <g className="pet-fire" style={{ animationDelay: '0.1s' }}>
        <ellipse cx="50" cy="175" rx="30" ry="45" fill={fireTip} opacity="0.5" />
        <ellipse cx="50" cy="185" rx="20" ry="30" fill={fireBase} opacity="0.8" />
      </g>
      <g className="pet-fire" style={{ animationDelay: '0.3s' }}>
        <ellipse cx="270" cy="170" rx="35" ry="50" fill={fireTip} opacity="0.5" />
        <ellipse cx="270" cy="182" rx="22" ry="32" fill={fireBase} opacity="0.8" />
      </g>

      {/* Table */}
      <rect x="60" y="190" width="200" height="12" fill="#6b3a1f" rx="3" />
      <rect x="80" y="202" width="16" height="50" fill="#5a2e0f" />
      <rect x="224" y="202" width="16" height="50" fill="#5a2e0f" />

      {/* Cup */}
      <rect x="148" y="170" width="24" height="22" fill="#d4a04a" rx="2" />
      <rect x="144" y="168" width="32" height="5" fill="#e0b060" rx="1" />
      <path d="M172,175 Q182,180 178,188" stroke="#d4a04a" strokeWidth="3" fill="none" />
      {/* Steam (smoke when sad/rugged) */}
      {(state === 'neutral' || state === 'happy' || state === 'ecstatic') && (
        <>
          <path d="M154,162 Q156,155 154,148" stroke="#ccc" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M160,160 Q162,153 160,146" stroke="#ccc" strokeWidth="2" fill="none" opacity="0.6" />
        </>
      )}

      {/* Dog body */}
      <g transform={isLyingDown ? 'translate(0, 30) rotate(-15, 160, 180)' : ''}>
        {/* Body */}
        <ellipse cx="160" cy="180" rx="55" ry="35" fill="#e8a84a" />

        {/* Tail */}
        <g className={wagClass}>
          <path d="M210,170 Q235,150 230,135" stroke="#e8a84a" strokeWidth="12" fill="none" strokeLinecap="round" />
        </g>

        {/* Head */}
        <ellipse cx="120" cy="155" rx="42" ry="38" fill="#e8a84a" />

        {/* Ears */}
        <ellipse cx="94" cy="130" rx="14" ry="20" fill="#d4923a" transform="rotate(-15,94,130)" />
        <ellipse cx="148" cy="128" rx="14" ry="20" fill="#d4923a" transform="rotate(15,148,128)" />

        {/* Snout */}
        <ellipse cx="110" cy="170" rx="22" ry="16" fill="#d4923a" />

        {/* Nose */}
        <ellipse cx="110" cy="163" rx="8" ry="5" fill="#2a1000" />

        {/* Eyes */}
        <g transform="translate(98,148)">
          <path d={eyePath} stroke="#2a1000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(117,148)">
          <path d={eyePath} stroke="#2a1000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>

        {/* Mouth */}
        <g transform="translate(99,172)">
          <path d={mouthPath} stroke="#2a1000" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Collar */}
        <rect x="94" y="185" width="52" height="10" fill="#cc2222" rx="3" />
        <rect x="116" y="183" width="10" height="14" fill="#ffcc00" rx="2" />

        {/* Front legs */}
        <rect x="115" y="208" width="18" height="30" fill="#e8a84a" rx="8" />
        <rect x="148" y="208" width="18" height="30" fill="#e8a84a" rx="8" />
        <ellipse cx="124" cy="238" rx="12" ry="6" fill="#d4923a" />
        <ellipse cx="157" cy="238" rx="12" ry="6" fill="#d4923a" />

        {/* Tears */}
        {showTears && (
          <>
            <ellipse cx="101" cy="160" rx="3" ry="5" fill="#88ccff" className="pet-tear" style={{ animationDelay: '0s' }} />
            <ellipse cx="128" cy="160" rx="3" ry="5" fill="#88ccff" className="pet-tear" style={{ animationDelay: '0.4s' }} />
            <ellipse cx="101" cy="165" rx="3" ry="5" fill="#88ccff" className="pet-tear" style={{ animationDelay: '0.8s' }} />
            <ellipse cx="128" cy="165" rx="3" ry="5" fill="#88ccff" className="pet-tear" style={{ animationDelay: '1.2s' }} />
          </>
        )}

        {/* Eyebrows — worried/sad */}
        {(state === 'worried' || state === 'sad' || state === 'rugged') && (
          <>
            <line x1="96" y1="143" x2="108" y2="146" stroke="#2a1000" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="118" y1="146" x2="130" y2="143" stroke="#2a1000" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Hat (ecstatic / happy party hat) */}
        {state === 'ecstatic' && (
          <g>
            <polygon points="120,115 148,115 134,75" fill="#ff3399" />
            <line x1="120" y1="115" x2="148" y2="115" stroke="#ffcc00" strokeWidth="3" />
            <circle cx="134" cy="74" r="5" fill="#ffcc00" />
          </g>
        )}
      </g>

      {/* Foreground fire (table fire when rugged) */}
      {state === 'rugged' && (
        <g className="pet-fire">
          <ellipse cx="160" cy="188" rx="40" ry="25" fill={fireBase} opacity="0.7" />
        </g>
      )}

      {/* Confetti particles */}
      {showConfetti && (
        <>
          {[['#ff3399', 80, 100, '0s'], ['#00ffcc', 160, 80, '0.15s'], ['#ffcc00', 240, 110, '0.3s'],
            ['#ff6600', 60, 140, '0.1s'], ['#aa00ff', 260, 130, '0.25s']].map(([color, x, y, delay], i) => (
            <rect
              key={i}
              x={Number(x) - 4} y={Number(y) - 4}
              width="8" height="8"
              fill={color as string}
              className="pet-confetti"
              style={{ animationDelay: delay as string, animationIterationCount: 'infinite' }}
            />
          ))}
        </>
      )}

      {/* Skull particles */}
      {showSkulls && (
        <>
          {[[100, 120, '0s'], [180, 100, '0.5s'], [240, 115, '1s']].map(([x, y, delay], i) => (
            <text
              key={i}
              x={Number(x)} y={Number(y)}
              fontSize="20"
              className="pet-skull"
              style={{ animationDelay: delay as string, animationIterationCount: 'infinite' }}
            >
              💀
            </text>
          ))}
        </>
      )}

      {/* "This is fine." speech bubble */}
      <g>
        <rect x="180" y="20" width="125" height="38" fill="white" rx="8" />
        <polygon points="190,58 200,70 210,58" fill="white" />
        <text x="195" y="38" fontSize="11" fill="#2a1000" fontFamily="'Comic Neue', cursive" fontWeight="bold">
          {state === 'neutral'  && 'This is fine.'}
          {state === 'happy'    && "I'm profitable!"}
          {state === 'ecstatic' && 'WE ARE SO BACK'}
          {state === 'worried'  && 'This is... fine?'}
          {state === 'sad'      && 'This is not fine.'}
          {state === 'rugged'   && 'I have no bags.'}
        </text>
      </g>
    </svg>
  )
}
