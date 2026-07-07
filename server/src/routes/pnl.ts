import { Router, Request, Response } from 'express'
import { prisma } from '../lib/db'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const wallet = req.query.wallet as string
  const date   = req.query.date as string   // YYYY-MM-DD

  if (!wallet || !date) return res.status(400).json({ error: 'wallet and date required' })

  const dayStart = new Date(`${date}T00:00:00.000Z`)
  const dayEnd   = new Date(`${date}T23:59:59.999Z`)

  const trades = await prisma.trade.findMany({
    where: {
      walletAddress: wallet,
      timestamp: { gte: dayStart, lte: dayEnd },
    },
  })

  const netPnlUsd = trades.reduce((sum, t) => sum + (t.realizedPnlUsd ?? 0), 0)

  res.json({ date, netPnlUsd, tradeCount: trades.length })
})

export default router
