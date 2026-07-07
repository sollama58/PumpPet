import { useState, useEffect } from 'react'
import { getDailyPnL } from '../lib/api'
import type { DailyPnL } from '../types'

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function usePnL(wallet: string | null, tradeCount: number) {
  const [pnl, setPnL] = useState<DailyPnL | null>(null)

  useEffect(() => {
    if (!wallet) {
      setPnL(null)
      return
    }
    getDailyPnL(wallet, todayUTC())
      .then(setPnL)
      .catch(() => null)
  }, [wallet, tradeCount])

  return pnl
}
