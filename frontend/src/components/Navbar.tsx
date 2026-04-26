import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Features', hasChevron: true },
  { label: 'Solutions', hasChevron: false },
  { label: 'Plans', hasChevron: false },
  { label: 'Learning', hasChevron: true },
]

function Logo() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <span className="text-foreground font-semibold text-lg tracking-tight">CarthaVillage</span>
  }
  return (
    <img
      src="/logo.png"
      alt="Logo"
      className="h-8 object-contain"
      onError={() => setFailed(true)}
    />
  )
}

export default function Navbar() {
  return (
    <div className="w-full">
      <nav className="flex w-full items-center justify-between py-5 px-8">
        <Logo />

        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(({ label, hasChevron }) => (
            <button
              key={label}
              className="flex items-center gap-1 text-foreground/90 text-base transition-colors hover:text-foreground"
            >
              {label}
              {hasChevron && <ChevronDown className="h-4 w-4 opacity-60" />}
            </button>
          ))}
        </div>

        <Button variant="heroSecondary" className="px-4 py-2 text-sm">
          Sign Up
        </Button>
      </nav>

      <div className="mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </div>
  )
}
