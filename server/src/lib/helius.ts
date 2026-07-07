const API_KEY = process.env.HELIUS_API_KEY!
const BASE = `https://api.helius.xyz/v0`

export interface HeliusSwapEvent {
  signature: string
  timestamp: number
  tokenTransfers: Array<{
    mint: string
    tokenAmount: number
    fromUserAccount: string | null
    toUserAccount: string | null
  }>
  nativeTransfers: Array<{
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }>
  type: string
}

/**
 * Fetch SWAP transactions for a wallet, stopping as soon as we hit
 * `knownSignature`. Helius returns newest-first so we walk forward in time
 * until we see something we already stored.
 */
export async function fetchNewSwaps(
  wallet: string,
  knownSignature?: string,
): Promise<HeliusSwapEvent[]> {
  const results: HeliusSwapEvent[] = []
  let before: string | undefined

  while (true) {
    const params = new URLSearchParams({ 'api-key': API_KEY, type: 'SWAP', limit: '50' })
    if (before) params.set('before', before)

    const res = await fetch(`${BASE}/addresses/${wallet}/transactions?${params}`)
    if (!res.ok) throw new Error(`Helius error ${res.status}`)
    const page: HeliusSwapEvent[] = await res.json()

    if (page.length === 0) break

    for (const tx of page) {
      if (tx.signature === knownSignature) return results   // hit known boundary
      results.push(tx)
    }

    if (page.length < 50) break   // last page
    before = page[page.length - 1].signature
  }

  return results
}
