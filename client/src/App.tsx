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

  // Portfolio estimate: sum of what was spent (usdValueIn) across today's buys as a rough cost basis
  const portfolioUsd = useMemo(
    () => trades.filter(t => t.costBasisUsd != null).reduce((s, t) => s + (t.costBasisUsd ?? 0), 0),
    [trades],
  )

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-amber-900/50">
        <h1 className="text-amber-400 text-2xl font-bold tracking-tight">
          🐶 PumpPet
        </h1>
        <WalletButton />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-5xl mx-auto w-full">
        {/* Pet column */}
        <section className="flex-1 flex flex-col items-center gap-4">
          <Pet netPnlUsd={pnl?.netPnlUsd ?? null} portfolioUsd={portfolioUsd} />
          {!wallet && (
            <p className="text-amber-700 text-sm text-center">
              Connect your wallet to start tracking your trades.
            </p>
          )}
        </section>

        {/* Data column */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
          <PnLDashboard pnl={pnl} loading={tradesLoading && !pnl} />
          <TradeList trades={trades} loading={tradesLoading && trades.length === 0} />
        </aside>
      </main>

      <footer className="text-center text-stone-700 text-xs py-4">
        This is fine. Trades update every 30s.
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
