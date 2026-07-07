import type { DailyPnL } from '../types'

interface Props {
  pnl: DailyPnL | null
  portfolioUsd: number
  loading: boolean
}

function fmtUsd(n: number): string {
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${n >= 0 ? '+' : '−'}$${abs}`
}

export function PnLDashboard({ pnl, portfolioUsd, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <div className="h-2.5 w-28 bg-dim rounded-full animate-pulse" />
        <div className="h-10 w-40 bg-dim rounded-lg animate-pulse" />
        <div className="h-2 w-24 bg-dim rounded-full animate-pulse" />
      </div>
    )
  }

  const net = pnl?.netPnlUsd ?? 0
  const isPos = net > 0
  const isNeg = net < 0
  const pct = portfolioUsd > 0 ? (net / portfolioUsd) * 100 : null

  const borderColor = pnl
    ? isPos ? 'border-profit/40' : isNeg ? 'border-loss/40' : 'border-border'
    : 'border-border'

  const numColor = isPos ? 'text-profit' : isNeg ? 'text-loss' : 'text-ink'

  return (
    <div className={`bg-surface border ${borderColor} rounded-xl p-5 transition-colors duration-500`}>
      <p className="text-muted text-[11px] font-bold uppercase tracking-widest mb-2">
        Today&apos;s P&amp;L
      </p>

      <div className={`text-4xl font-bold tabular-nums leading-none ${numColor}`}>
        {pnl ? fmtUsd(net) : <span className="text-dim text-3xl">—</span>}
      </div>

      {pnl ? (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {pct !== null && (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPos ? 'bg-profit/15 text-profit'
              : isNeg ? 'bg-loss/15 text-loss'
              : 'bg-dim text-muted'
            }`}>
              {isPos ? '▲' : isNeg ? '▼' : '●'}
              {Math.abs(pct).toFixed(1)}%
            </span>
          )}
          <span className="text-muted text-xs">
            {pnl.tradeCount} trade{pnl.tradeCount !== 1 ? 's' : ''}
          </span>
        </div>
      ) : (
        !loading && (
          <p className="text-muted text-xs mt-2">No trades recorded yet today.</p>
        )
      )}
    </div>
  )
}
