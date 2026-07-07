import './pet.css'

const W     = 1028
const WALL  = 56
const ROOF  = 130

export function BurningHouse({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative select-none" style={{ width: W, paddingTop: ROOF }}>

      {/* ── Roof ───────────────────────────────────────────────────────── */}
      <svg
        className="absolute top-0 left-0 pointer-events-none z-20"
        width={W} height={ROOF + 20}
        viewBox={`0 0 ${W} ${ROOF + 20}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <pattern id="shingle" width="60" height="28" patternUnits="userSpaceOnUse">
            <rect width="60" height="28" fill="#1a0800" />
            <rect x="2" y="2" width="56" height="12" fill="#271008" rx="2" />
            <rect x="32" y="16" width="26" height="10" fill="#271008" rx="2" />
            <rect x="2"  y="16" width="26" height="10" fill="#271008" rx="2" />
          </pattern>
        </defs>

        {/* Roof fill */}
        <polygon
          points={`${W / 2},6 0,${ROOF + 20} ${W},${ROOF + 20}`}
          fill="url(#shingle)"
        />
        {/* Roof ridge outline */}
        <polygon
          points={`${W / 2},6 0,${ROOF + 20} ${W},${ROOF + 20}`}
          fill="none" stroke="#3a1808" strokeWidth="4"
        />
        {/* Roof crown */}
        <circle cx={W / 2} cy="6" r="6" fill="#4a2010" />

        {/* Chimney */}
        <rect x="690" y="28"  width="76" height="96" fill="#120600" stroke="#3a1808" strokeWidth="3" />
        <rect x="680" y="20"  width="96" height="22" fill="#1f0c04" stroke="#3a1808" strokeWidth="2" />
        {/* Chimney bricks */}
        {[0,1,2].map(i => (
          <rect key={i} x="692" y={30 + i * 30} width="72" height="14" fill="#1f0c04" rx="2" />
        ))}

        {/* Chimney fire */}
        <ellipse cx="728" cy="18" rx="26" ry="38" fill="#ff5500" opacity="0.65"
          className="pet-fire" style={{ transformOrigin: '728px 18px' }} />
        <ellipse cx="728" cy="6"  rx="16" ry="26" fill="#ffaa00" opacity="0.55"
          className="pet-fire" style={{ animationDelay: '0.22s', transformOrigin: '728px 6px' }} />
        <ellipse cx="724" cy="-2" rx="9"  ry="18" fill="#ffee44" opacity="0.45"
          className="pet-fire" style={{ animationDelay: '0.44s', transformOrigin: '724px -2px' }} />

        {/* Glow at roof base */}
        <ellipse cx={W * 0.28} cy={ROOF + 16} rx="130" ry="22" fill="#ff4400"
          opacity="0.18" className="pet-fire" style={{ transformOrigin: `${W * 0.28}px ${ROOF + 16}px` }} />
        <ellipse cx={W * 0.72} cy={ROOF + 12} rx="150" ry="20" fill="#ff6600"
          opacity="0.18" className="pet-fire"
          style={{ animationDelay: '0.3s', transformOrigin: `${W * 0.72}px ${ROOF + 12}px` }} />
      </svg>

      {/* ── House body ─────────────────────────────────────────────────── */}
      <div className="relative" style={{ width: W, height: W }}>
        {/* Pet scene */}
        <div className="absolute inset-0 z-0">{children}</div>

        {/* Wall frame SVG overlay */}
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          width={W} height={W}
          viewBox={`0 0 ${W} ${W}`}
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
        >
          <defs>
            <pattern id="bv" x="0" y="0" width="56" height="28" patternUnits="userSpaceOnUse">
              <rect width="56" height="28" fill="#0d0600" />
              <rect x="2" y="2" width="52" height="12" fill="#1f0c04" rx="2" />
              <rect x="30" y="16" width="24" height="10" fill="#1f0c04" rx="2" />
              <rect x="2"  y="16" width="24" height="10" fill="#1f0c04" rx="2" />
            </pattern>
            <pattern id="bh" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
              <rect width="100" height="50" fill="#0d0600" />
              <rect x="2" y="2" width="96" height="22" fill="#1f0c04" rx="2" />
              <rect x="52" y="26" width="46" height="22" fill="#1f0c04" rx="2" />
              <rect x="2"  y="26" width="46" height="22" fill="#1f0c04" rx="2" />
            </pattern>
          </defs>

          {/* Walls */}
          <rect x="0"       y="0" width={WALL}      height={W}    fill="url(#bv)" />
          <rect x={W - WALL} y="0" width={WALL}      height={W}    fill="url(#bv)" />
          <rect x="0"       y="0" width={W}          height={WALL} fill="url(#bh)" />
          <rect x="0"       y={W - WALL} width={W}   height={WALL} fill="url(#bh)" />

          {/* Inner depth shadows */}
          <rect x={WALL}       y={WALL}       width={W - WALL * 2} height="8" fill="#00000088" />
          <rect x={WALL}       y={WALL}       width="8"            height={W - WALL * 2} fill="#00000088" />
          <rect x={W - WALL - 8} y={WALL}     width="8"            height={W - WALL * 2} fill="#00000088" />
          <rect x={WALL}       y={W - WALL - 8} width={W - WALL * 2} height="8" fill="#00000088" />

          {/* Window trim */}
          <rect x={WALL}       y={WALL}       width={W - WALL * 2} height="14" fill="#2a1008" />
          <rect x={WALL}       y={W - WALL - 14} width={W - WALL * 2} height="14" fill="#2a1008" />
          <rect x={WALL}       y={WALL}       width="14"           height={W - WALL * 2} fill="#2a1008" />
          <rect x={W - WALL - 14} y={WALL}   width="14"            height={W - WALL * 2} fill="#2a1008" />

          {/* Fire on left wall */}
          <ellipse cx={WALL / 2} cy={W * 0.62} rx={WALL * 0.55} ry={W * 0.19}
            fill="#ff5500" opacity="0.45" className="pet-fire"
            style={{ transformOrigin: `${WALL / 2}px ${W * 0.62}px` }} />
          <ellipse cx={WALL / 2} cy={W * 0.44} rx={WALL * 0.34} ry={W * 0.13}
            fill="#ffaa00" opacity="0.36" className="pet-fire"
            style={{ animationDelay: '0.32s', transformOrigin: `${WALL / 2}px ${W * 0.44}px` }} />

          {/* Fire on right wall */}
          <ellipse cx={W - WALL / 2} cy={W * 0.57} rx={WALL * 0.55} ry={W * 0.21}
            fill="#ff5500" opacity="0.45" className="pet-fire"
            style={{ animationDelay: '0.14s', transformOrigin: `${W - WALL / 2}px ${W * 0.57}px` }} />
          <ellipse cx={W - WALL / 2} cy={W * 0.38} rx={WALL * 0.34} ry={W * 0.12}
            fill="#ffaa00" opacity="0.36" className="pet-fire"
            style={{ animationDelay: '0.48s', transformOrigin: `${W - WALL / 2}px ${W * 0.38}px` }} />

          {/* Fire on top beam */}
          <ellipse cx={W * 0.3}  cy={WALL * 0.65} rx={W * 0.14} ry={WALL * 0.5}
            fill="#ff4400" opacity="0.38" className="pet-fire"
            style={{ animationDelay: '0.08s', transformOrigin: `${W * 0.3}px ${WALL * 0.65}px` }} />
          <ellipse cx={W * 0.67} cy={WALL * 0.65} rx={W * 0.15} ry={WALL * 0.5}
            fill="#ff6600" opacity="0.34" className="pet-fire"
            style={{ animationDelay: '0.37s', transformOrigin: `${W * 0.67}px ${WALL * 0.65}px` }} />
        </svg>

        {/* Ambient glow box-shadow */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            boxShadow:
              '0 0 100px 40px rgba(255,80,0,0.22), inset 0 0 60px 12px rgba(255,80,0,0.09)',
          }}
        />
      </div>
    </div>
  )
}
