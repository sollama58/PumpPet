const API_KEY = process.env.BIRDEYE_API_KEY!
const BASE = 'https://public-api.birdeye.so'

// Birdeye free tier: 1000 req/month — used only for non-stablecoin historical SOL price
const cache = new Map<string, number>()

export async function getHistoricalPrice(mint: string, unixTimestamp: number): Promise<number | null> {
  const minute = Math.floor(unixTimestamp / 60) * 60
  const key = `${mint}:${minute}`
  if (cache.has(key)) return cache.get(key)!

  try {
    const params = new URLSearchParams({
      address: mint,
      address_type: 'token',
      type: '1m',
      time_from: String(minute - 60),
      time_to: String(minute + 60),
    })
    const res = await fetch(`${BASE}/defi/history_price?${params}`, {
      headers: { 'X-API-KEY': API_KEY },
    })
    if (!res.ok) return null
    const data = await res.json()
    const items: Array<{ unixTime: number; value: number }> = data?.data?.items ?? []
    if (items.length === 0) return null
    const closest = items.reduce((a, b) =>
      Math.abs(a.unixTime - unixTimestamp) <= Math.abs(b.unixTime - unixTimestamp) ? a : b,
    )
    cache.set(key, closest.value)
    return closest.value
  } catch {
    return null
  }
}
