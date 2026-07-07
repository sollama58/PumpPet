const BASE = 'https://lite-api.jup.ag/price/v2'

export async function getCurrentPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) return {}
  const res = await fetch(`${BASE}?ids=${mints.join(',')}`)
  if (!res.ok) throw new Error(`Jupiter price error ${res.status}`)
  const data = await res.json()
  const result: Record<string, number> = {}
  for (const [mint, info] of Object.entries(data.data ?? {})) {
    const price = (info as { price?: string }).price
    if (price) result[mint] = parseFloat(price)
  }
  return result
}
