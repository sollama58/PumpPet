import { useMemo, useRef, useEffect, useState } from 'react'
import { PetSVG } from './PetSVG'
import type { PetState } from '../../types'
import './pet.css'

interface Props {
  netPnlUsd: number | null
  portfolioUsd: number
}

function computeState(netPnlUsd: number | null, portfolioUsd: number): PetState {
  if (netPnlUsd === null) return 'neutral'
  const pct = portfolioUsd > 0 ? netPnlUsd / portfolioUsd : 0
  if (netPnlUsd > 0 && pct >= 0.10) return 'ecstatic'
  if (netPnlUsd > 0) return 'happy'
  if (netPnlUsd < 0 && pct <= -0.20) return 'rugged'
  if (netPnlUsd < 0 && pct <= -0.05) return 'sad'
  if (netPnlUsd < 0) return 'worried'
  return 'neutral'
}

export function Pet({ netPnlUsd, portfolioUsd }: Props) {
  const state = useMemo(() => computeState(netPnlUsd, portfolioUsd), [netPnlUsd, portfolioUsd])
  const prevState = useRef<PetState>(state)
  const [pulseClass, setPulseClass] = useState('')

  useEffect(() => {
    if (prevState.current === state) return
    const isGain = state === 'happy' || state === 'ecstatic'
    setPulseClass(isGain ? 'pet-bounce' : 'pet-shake')
    const t = setTimeout(() => setPulseClass(''), 500)
    prevState.current = state
    return () => clearTimeout(t)
  }, [state])

  return (
    <div className={`transition-all duration-500 ${pulseClass}`}>
      <PetSVG state={state} />
    </div>
  )
}
