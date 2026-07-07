import type { DailyPnL } from '../types'

interface Props {
  pnl: DailyPnL | null
  loading: boolean
}

function fmt(n: number): string {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${n >= 0 ? '+' : '-'}$${abs}`
}

export function PnLDashboard({ pnl, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-stone-900 border border-amber-900 rounded-xl p-6 text-center">
        <p className="text-amber-600 text-sm">Loading P&amp;L...</p>
      </div>
    )
  }

  const net = pnl?.netPnlUsd ?? 0
  const isPositive = net >= 0

  return (
    <div className="bg-stone-900 border border-amber-900 rounded-xl p-6">
      <h2 className="text-amber-500 text-xs uppercase tracking-widest mb-1">Today's Net P&amp;L</h2>
      <div className={`text-4xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {pnl ? fmt(net) : '--'}
      </div>
      {pnl && (
        <p className="text-stone-500 text-xs mt-2">
          {pnl.tradeCount} trade{pnl.tradeCount !== 1 ? 's' : ''} today
        </p>
      )}
    </div>
  )
}
