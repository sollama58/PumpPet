import type { Trade } from '../types'

interface Props {
  trades: Trade[]
  loading: boolean
}

function fmtPnl(n: number | null): string {
  if (n === null) return '—'
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${n >= 0 ? '+' : '−'}$${abs}`
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function shortMint(mint: string): string {
  return mint.slice(0, 4) + '…' + mint.slice(-4)
}

function tradeKind(t: Trade): 'buy' | 'sell' | 'consumed' {
  if (t.costBasisUsd != null) return t.realizedPnlUsd === 0 ? 'consumed' : 'buy'
  return 'sell'
}

export function TradeList({ trades, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="h-2.5 w-28 bg-dim rounded-full animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
            <div className="h-2 w-10 bg-dim rounded animate-pulse" />
            <div className="h-5 w-14 bg-dim rounded-full animate-pulse" />
            <div className="h-2 flex-1 bg-dim rounded animate-pulse" />
            <div className="h-2 w-12 bg-dim rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-amber text-[10px] font-bold uppercase tracking-[0.18em]">
          Recent Trades
        </h2>
        {trades.length > 0 && (
          <span className="text-dim text-[10px] tabular-nums">
            {trades.length} today
          </span>
        )}
      </div>

      {trades.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-muted text-sm">No trades yet today.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-y-auto max-h-80">
          {trades.slice(0, 15).map(t => {
            const kind      = tradeKind(t)
            const isSell    = kind === 'sell'
            const isConsumed = kind === 'consumed'
            const hasPnl    = isSell && t.realizedPnlUsd !== null
            const isProfit  = hasPnl && t.realizedPnlUsd! > 0
            const isLoss    = hasPnl && t.realizedPnlUsd! < 0
            const tokenIn   = t.tokenInSymbol  ?? shortMint(t.tokenInMint)
            const tokenOut  = t.tokenOutSymbol ?? shortMint(t.tokenOutMint)

            return (
              <li
                key={t.id}
                className={`flex items-center gap-2.5 px-5 py-3 hover:bg-surface2 transition-colors ${isConsumed ? 'opacity-40' : ''}`}
              >
                <span className="text-muted text-[10px] tabular-nums w-10 shrink-0 font-mono">
                  {fmtTime(t.timestamp)}
                </span>

                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 tracking-wide ${
                  isSell
                    ? 'bg-loss/10 text-loss border-loss/25'
                    : 'bg-amber/10 text-amber border-amber/25'
                }`}>
                  {isSell ? 'SELL' : 'BUY'}
                </span>

                <span className="text-ink text-xs flex-1 min-w-0 truncate font-mono">
                  {tokenIn}
                  <span className="text-dim mx-1">→</span>
                  {tokenOut}
                </span>

                <span className={`text-xs font-bold shrink-0 tabular-nums font-mono ${
                  isProfit ? 'text-profit'
                  : isLoss ? 'text-loss'
                  : 'text-muted'
                }`}>
                  {isSell ? fmtPnl(t.realizedPnlUsd) : <span className="text-dim text-[10px]">open</span>}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
