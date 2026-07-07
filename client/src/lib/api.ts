import type { Trade, DailyPnL } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export function syncTrades(wallet: string): Promise<Trade[]> {
  return get<Trade[]>(`/api/trades/sync?wallet=${wallet}`)
}

export function getDailyPnL(wallet: string, date: string): Promise<DailyPnL> {
  return get<DailyPnL>(`/api/pnl?wallet=${wallet}&date=${date}`)
}

export function getCurrentPrices(mints: string[]): Promise<Record<string, number>> {
  return get<Record<string, number>>(`/api/prices?mints=${mints.join(',')}`)
}
