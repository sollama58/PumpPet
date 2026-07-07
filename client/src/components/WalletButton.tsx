import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function WalletButton() {
  return (
    <WalletMultiButton
      className="!bg-orange-900 hover:!bg-orange-800 !border !border-border-lit !rounded-lg !text-sm !font-bold !h-9 !px-4"
      style={{ fontFamily: 'inherit' }}
    />
  )
}
