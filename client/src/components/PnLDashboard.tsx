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
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <div className="h-2.5 w-24 bg-dim rounded-full animate-pulse" />
        <div className="h-12 w-44 bg-dim rounded-xl animate-pulse" />
        <div className="h-2 w-20 bg-dim rounded-full animate-pulse" />
      </div>
    )
  }

  const net    = pnl?.netPnlUsd ?? 0
  const isPos  = net > 0
  const isNeg  = net < 0
  const pct    = portfolioUsd > 0 ? (net / portfolioUsd) * 100 : null

  const borderColor = pnl
    ? isPos ? 'border-profit/30' : isNeg ? 'border-loss/30' : 'border-border'
    : 'border-border'

  const glowColor = pnl
    ? isPos ? 'shadow-[0_0_24px_0px_rgba(74,222,128,0.08)]'
    : isNeg ? 'shadow-[0_0_24px_0px_rgba(248,113,113,0.08)]'
    : '' : ''

  const numColor = isPos ? 'text-profit' : isNeg ? 'text-loss' : 'text-ink'

  return (
    <div className={`bg-surface border ${borderColor} ${glowColor} rounded-2xl p-6 transition-all duration-500`}>
      <p className="text-muted text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
        Today&apos;s P&amp;L
      </p>

      <div className={`text-5xl font-bold tabular-nums leading-none ${numColor}`}>
        {pnl ? fmtUsd(net) : <span className="text-dim text-4xl">—</span>}
      </div>

      {pnl ? (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {pct !== null && (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${
              isPos ? 'bg-profit/10 text-profit border border-profit/20'
              : isNeg ? 'bg-loss/10 text-loss border border-loss/20'
              : 'bg-dim text-muted border border-border'
            }`}>
              {isPos ? '▲' : isNeg ? '▼' : '●'}
              {Math.abs(pct).toFixed(1)}%
            </span>
          )}
          <span className="text-muted text-xs">
            {pnl.tradeCount} trade{pnl.tradeCount !== 1 ? 's' : ''}
          </span>
          {portfolioUsd > 0 && (
            <span className="text-dim text-xs tabular-nums ml-auto">
              ${portfolioUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} in
            </span>
          )}
        </div>
      ) : (
        !loading && (
          <p className="text-muted text-xs mt-3">No trades recorded yet today.</p>
        )
      )}
    </div>
  )
}
