import { Router, Request, Response } from 'express'
import { getCurrentPrices } from '../lib/jupiter'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const mints = (req.query.mints as string ?? '').split(',').filter(Boolean)
  if (mints.length === 0) return res.json({})
  const prices = await getCurrentPrices(mints)
  res.json(prices)
})

export default router
