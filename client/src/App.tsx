import { useMemo, useState } from 'react'
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

function isValidSolanaAddress(addr: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim())
}

function AppInner() {
  const { publicKey } = useWallet()
  const connectedWallet = publicKey?.toBase58() ?? null

  const [simInput, setSimInput]   = useState('')
  const [simAddr,  setSimAddr]    = useState<string | null>(null)
  const [simError, setSimError]   = useState('')

  const wallet = connectedWallet || simAddr

  const { trades, loading: tradesLoading } = useTrades(wallet)
  const pnl = usePnL(wallet, trades.length)

  const portfolioUsd = useMemo(
    () => trades.filter(t => t.costBasisUsd != null).reduce((s, t) => s + (t.costBasisUsd ?? 0), 0),
    [trades],
  )

  function handleSimulate() {
    const addr = simInput.trim()
    if (!addr) { setSimAddr(null); setSimError(''); return }
    if (!isValidSolanaAddress(addr)) { setSimError('Invalid Solana address'); return }
    setSimError('')
    setSimAddr(addr)
  }

  function clearSim() {
    setSimAddr(null)
    setSimInput('')
    setSimError('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg overflow-x-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl leading-none">🔥</span>
            <span className="text-amber font-bold text-xl tracking-tight">PumpPet</span>
          </div>
          <span className="hidden sm:block text-dim text-xs border border-border px-2 py-0.5 rounded-full">
            degen companion
          </span>
        </div>

        <div className="flex items-center gap-3">
          {wallet && (
            <span className="hidden md:block text-muted text-xs font-mono bg-surface border border-border px-3 py-1.5 rounded-lg">
              {wallet.slice(0, 4)}…{wallet.slice(-4)}
              {simAddr && !connectedWallet && (
                <span className="ml-2 text-amber text-[10px] font-bold uppercase tracking-wide">simulated</span>
              )}
            </span>
          )}
          <WalletButton />
        </div>
      </header>

      {/* ── Simulate wallet banner (when no wallet connected) ────────────── */}
      {!connectedWallet && (
        <div className="border-b border-border bg-surface2/80 px-6 py-4">
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-muted text-xs font-bold uppercase tracking-widest mb-1.5">
                Simulate any wallet
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={simInput}
                  onChange={e => { setSimInput(e.target.value); setSimError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSimulate()}
                  placeholder="Paste a Solana wallet address…"
                  className="flex-1 min-w-0 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-dim focus:outline-none focus:border-border-lit transition-colors font-mono"
                  spellCheck={false}
                />
                <button
                  onClick={handleSimulate}
                  className="shrink-0 bg-amber/10 hover:bg-amber/20 border border-amber/30 hover:border-amber/60 text-amber text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Load
                </button>
                {simAddr && (
                  <button
                    onClick={clearSim}
                    className="shrink-0 bg-dim/30 hover:bg-dim/60 border border-border text-muted text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              {simError && <p className="text-loss text-xs mt-1">{simError}</p>}
            </div>

            {simAddr && (
              <div className="flex items-center gap-2 text-amber text-xs bg-amber/10 border border-amber/20 px-3 py-2 rounded-lg shrink-0">
                <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
                Simulating
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center gap-8 px-4 py-10">

        <div className="flex flex-col 2xl:flex-row gap-10 items-start justify-center w-full">

          {/* ── Burning house (pet scene) ─────────────────────────────── */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Pet netPnlUsd={pnl?.netPnlUsd ?? null} portfolioUsd={portfolioUsd} />

            {!wallet && (
              <p className="text-muted text-sm text-center max-w-sm leading-relaxed mt-4">
                Connect a wallet or paste an address above to watch your pet react to today&apos;s P&amp;L.
              </p>
            )}
          </div>

          {/* ── Stats sidebar ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 w-full 2xl:w-80 2xl:sticky 2xl:top-24 shrink-0">
            <PnLDashboard pnl={pnl} portfolioUsd={portfolioUsd} loading={tradesLoading && !pnl} />
            <TradeList trades={trades} loading={tradesLoading && trades.length === 0} />

            {simAddr && !connectedWallet && (
              <button
                onClick={clearSim}
                className="text-muted text-xs hover:text-loss transition-colors text-center py-2 border border-border rounded-lg hover:border-loss/40"
              >
                Clear simulation
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="text-center text-dim text-xs py-4 border-t border-border">
        This is fine.&nbsp;&nbsp;•&nbsp;&nbsp;Trades sync every 30s
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
