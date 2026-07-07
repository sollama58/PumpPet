import type { Trade } from '../types'

interface Props {
  trades: Trade[]
  loading: boolean
}

function fmtPnl(n: number | null): string {
  if (n === null) return '—'
  const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${n >= 0 ? '+' : '-'}$${abs}`
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function shortMint(mint: string): string {
  return mint.slice(0, 4) + '…' + mint.slice(-4)
}

export function TradeList({ trades, loading }: Props) {
  return (
    <div className="bg-stone-900 border border-amber-900 rounded-xl p-4">
      <h2 className="text-amber-500 text-xs uppercase tracking-widest mb-3">Recent Trades</h2>
      {loading && <p className="text-stone-500 text-sm text-center py-4">Loading...</p>}
      {!loading && trades.length === 0 && (
        <p className="text-stone-500 text-sm text-center py-4">No trades today yet.</p>
      )}
      <ul className="space-y-2">
        {trades.slice(0, 10).map((t) => {
          const isProfit = t.realizedPnlUsd !== null && t.realizedPnlUsd >= 0
          const isLoss = t.realizedPnlUsd !== null && t.realizedPnlUsd < 0
          return (
            <li key={t.id} className="flex items-center justify-between text-sm border-b border-stone-800 pb-2 last:border-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-stone-300 font-medium">
                  {t.tokenInSymbol ?? shortMint(t.tokenInMint)}
                  {' '}<span className="text-amber-600">→</span>{' '}
                  {t.tokenOutSymbol ?? shortMint(t.tokenOutMint)}
                </span>
                <span className="text-stone-500 text-xs">{fmtTime(t.timestamp)}</span>
              </div>
              <span className={`font-bold ${isProfit ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-stone-400'}`}>
                {fmtPnl(t.realizedPnlUsd)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
