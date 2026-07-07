import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import '@solana/wallet-adapter-react-ui/styles.css'

import { WalletButton } from './components/WalletButton'
import { Pet } from './components/Pet/Pet'
import { PnLDashboard } from './components/PnLDashboard'
import { TradeList } from './components/TradeList'
import { useTrades } from './hooks/useTrades'
import { usePnL } from './hooks/usePnL'

const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com'

function AppInner() {
  const { publicKey } = useWallet()
  const wallet = publicKey?.toBase58() ?? null

  const { trades, loading: tradesLoading } = useTrades(wallet)
  const pnl = usePnL(wallet, trades.length)

  // Total capital deployed today: all buy records (open + consumed).
  // Consumed buys still carry their costBasisUsd, which is correct for
  // computing "what % of what I invested did I gain/lose today".
  const portfolioUsd = useMemo(
    () => trades.filter(t => t.costBasisUsd != null).reduce((s, t) => s + (t.costBasisUsd ?? 0), 0),
    [trades],
  )

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-baseline gap-2">
          <span className="text-xl">🔥</span>
          <h1 className="text-amber font-bold text-lg tracking-tight leading-none">PumpPet</h1>
          <span className="text-muted text-xs hidden sm:block">your degen pet</span>
        </div>
        <WalletButton />
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-5xl mx-auto w-full items-start">
        {/* Pet column */}
        <section className="flex-1 flex flex-col items-center gap-3 lg:sticky lg:top-8">
          <Pet netPnlUsd={pnl?.netPnlUsd ?? null} portfolioUsd={portfolioUsd} />
          {!wallet && (
            <p className="text-muted text-sm text-center max-w-xs leading-relaxed">
              Connect your wallet to see your pet react to today&apos;s trading P&amp;L.
            </p>
          )}
        </section>

        {/* Data column */}
        <aside className="w-full lg:w-72 flex flex-col gap-3">
          <PnLDashboard pnl={pnl} portfolioUsd={portfolioUsd} loading={tradesLoading && !pnl} />
          <TradeList trades={trades} loading={tradesLoading && trades.length === 0} />
        </aside>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center text-dim text-xs py-4 border-t border-border">
        This is fine. &nbsp;•&nbsp; Trades sync every 30s
      </footer>
    </div>
  )
}

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppInner />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
