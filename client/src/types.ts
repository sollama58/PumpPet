export interface Trade {
  id: string
  signature: string
  timestamp: string
  tokenInMint: string
  tokenInAmount: number
  tokenInSymbol: string | null
  tokenOutMint: string
  tokenOutAmount: number
  tokenOutSymbol: string | null
  usdValueIn: number
  usdValueOut: number
  realizedPnlUsd: number | null
}

export interface DailyPnL {
  date: string
  netPnlUsd: number
  tradeCount: number
}

export type PetState = 'neutral' | 'happy' | 'ecstatic' | 'worried' | 'sad' | 'rugged'
