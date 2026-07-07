import path from 'path'
import express, { type Request, type Response } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import tradesRouter from './routes/trades'
import pnlRouter    from './routes/pnl'
import pricesRouter from './routes/prices'

const app  = express()
const PORT = process.env.PORT ?? 3001
const isProd = process.env.NODE_ENV === 'production'

app.use(cors({ origin: isProd ? false : (process.env.CLIENT_ORIGIN ?? '*') }))
app.use(express.json())
app.use(rateLimit({ windowMs: 60_000, max: 60 }))

app.use('/api/trades', tradesRouter)
app.use('/api/pnl',    pnlRouter)
app.use('/api/prices', pricesRouter)
app.get('/health', (_: Request, res: Response) => res.json({ ok: true }))

// Serve the React app in production — must come after API routes
if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (_: Request, res: Response) => res.sendFile(path.join(clientDist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`PumpPet listening on :${PORT} (${isProd ? 'production' : 'development'})`)
})
