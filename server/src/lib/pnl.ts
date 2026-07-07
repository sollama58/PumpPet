import { getHistoricalPrice } from './birdeye'

// Well-known mint addresses
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
const SOL_MINT = 'So11111111111111111111111111111111111111112'

export function isStablecoin(mint: string): boolean {
  return mint === USDC_MINT || mint === USDT_MINT
}

export function isSOL(mint: string): boolean {
  return mint === SOL_MINT
}

export async function resolveUsdValue(
  mint: string,
  amount: number,
  unixTimestamp: number,
): Promise<number | null> {
  if (isStablecoin(mint)) {
    // Stablecoin amount is USD directly (already in token units, 6 decimals handled by Helius)
    return amount
  }

  if (isSOL(mint)) {
    // Amount here is in SOL (not lamports — Helius normalises)
    const price = await getHistoricalPrice(SOL_MINT, unixTimestamp)
    return price !== null ? amount * price : null
  }

  // Token-to-token: look up historical price for tokenIn/Out mint
  const price = await getHistoricalPrice(mint, unixTimestamp)
  return price !== null ? amount * price : null
}

export interface SwapAmounts {
  tokenInMint: string
  tokenInAmount: number
  tokenOutMint: string
  tokenOutAmount: number
  timestamp: number
}

export async function calculateUsdValues(
  swap: SwapAmounts,
): Promise<{ usdValueIn: number; usdValueOut: number }> {
  const [usdIn, usdOut] = await Promise.all([
    resolveUsdValue(swap.tokenInMint, swap.tokenInAmount, swap.timestamp),
    resolveUsdValue(swap.tokenOutMint, swap.tokenOutAmount, swap.timestamp),
  ])

  // Fall back to cross-pricing if one side is available
  return {
    usdValueIn:  usdIn  ?? usdOut ?? 0,
    usdValueOut: usdOut ?? usdIn  ?? 0,
  }
}
