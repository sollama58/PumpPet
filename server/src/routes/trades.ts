import { Router, Request, Response } from 'express'
import { fetchNewSwaps } from '../lib/helius'
import { calculateUsdValues } from '../lib/pnl'
import { prisma } from '../lib/db'

const router = Router()

const KNOWN_SYMBOLS: Record<string, string> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
  'So11111111111111111111111111111111111111112':    'SOL',
}

router.get('/sync', async (req: Request, res: Response) => {
  const wallet = req.query.wallet as string
  if (!wallet) return res.status(400).json({ error: 'wallet required' })

  try {
    await prisma.wallet.upsert({ where: { address: wallet }, create: { address: wallet }, update: {} })

    // Use the most-recent stored signature as the stop-boundary for incremental fetch
    const latest = await prisma.trade.findFirst({
      where: { walletAddress: wallet },
      orderBy: { timestamp: 'desc' },
      select: { signature: true },
    })

    const rawTxs = await fetchNewSwaps(wallet, latest?.signature ?? undefined)

    for (const tx of rawTxs) {
      if (!tx.tokenTransfers || tx.tokenTransfers.length < 2) continue

      const outgoing = tx.tokenTransfers.filter(t => t.fromUserAccount === wallet)
      const incoming = tx.tokenTransfers.filter(t => t.toUserAccount === wallet)
      if (outgoing.length === 0 || incoming.length === 0) continue

      const tokenIn  = outgoing[0]
      const tokenOut = incoming[0]

      const { usdValueIn, usdValueOut } = await calculateUsdValues({
        tokenInMint:    tokenIn.mint,
        tokenInAmount:  tokenIn.tokenAmount,
        tokenOutMint:   tokenOut.mint,
        tokenOutAmount: tokenOut.tokenAmount,
        timestamp:      tx.timestamp,
      })

      // FIFO: find oldest unmatched buy of tokenIn to compute realized P&L
      const priorBuy = await prisma.trade.findFirst({
        where: {
          walletAddress:  wallet,
          tokenOutMint:   tokenIn.mint,   // we previously received this token
          costBasisUsd:   { not: null },
          realizedPnlUsd: null,           // not yet matched to a sell
        },
        orderBy: { timestamp: 'asc' },
      })

      let costBasisUsd: number | null = null
      let realizedPnlUsd: number | null = null

      if (priorBuy?.costBasisUsd != null) {
        // This is a sell — compute realized P&L and mark the prior buy as consumed
        realizedPnlUsd = usdValueOut - priorBuy.costBasisUsd
        await prisma.trade.update({
          where: { id: priorBuy.id },
          data:  { realizedPnlUsd: 0 },  // 0 = consumed marker; P&L recorded on the sell
        })
      } else {
        // This is a buy — record cost basis so a future sell can match it
        costBasisUsd = usdValueIn
      }

      await prisma.trade.upsert({
        where: { signature: tx.signature },
        create: {
          walletAddress:  wallet,
          signature:      tx.signature,
          timestamp:      new Date(tx.timestamp * 1000),
          tokenInMint:    tokenIn.mint,
          tokenInAmount:  tokenIn.tokenAmount,
          tokenInSymbol:  KNOWN_SYMBOLS[tokenIn.mint] ?? null,
          tokenOutMint:   tokenOut.mint,
          tokenOutAmount: tokenOut.tokenAmount,
          tokenOutSymbol: KNOWN_SYMBOLS[tokenOut.mint] ?? null,
          usdValueIn,
          usdValueOut,
          costBasisUsd,
          realizedPnlUsd,
        },
        update: {},
      })
    }

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    const trades = await prisma.trade.findMany({
      where: { walletAddress: wallet, timestamp: { gte: todayStart } },
      orderBy: { timestamp: 'desc' },
    })

    res.json(trades)
  } catch (err) {
    console.error('Trade sync error:', err)
    res.status(500).json({ error: 'Failed to sync trades' })
  }
})

export default router
