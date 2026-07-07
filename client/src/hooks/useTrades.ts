import { useState, useEffect, useCallback, useRef } from 'react'
import { syncTrades } from '../lib/api'
import type { Trade } from '../types'

const POLL_INTERVAL = 30_000

export function useTrades(wallet: string | null) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const latestSigRef = useRef<string | null>(null)

  const sync = useCallback(async () => {
    if (!wallet) return
    try {
      const fresh = await syncTrades(wallet)
      setTrades(fresh)
      setError(null)
      latestSigRef.current = fresh[0]?.signature ?? null
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trades')
    }
  }, [wallet])

  useEffect(() => {
    if (!wallet) {
      setTrades([])
      setError(null)
      return
    }
    setLoading(true)
    sync().finally(() => setLoading(false))
    const id = setInterval(sync, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [wallet, sync])

  return { trades, loading, error }
}
