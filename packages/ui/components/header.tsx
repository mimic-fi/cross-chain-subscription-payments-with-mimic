import Image from 'next/image'
import ConnectWalletButton from '@/components/ui/connect-wallet-button'

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/mimic-logo.svg" alt="Mimic" width={320} height={27} className="h-7 w-auto" />
        </div>
        <ConnectWalletButton className="px-[50px] bg-primary-light hover:bg-primary-dark" />
      </div>
    </header>
  )
}
