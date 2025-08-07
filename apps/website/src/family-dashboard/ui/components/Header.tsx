import React from 'react'

export function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-sm bg-teal-400" />
          <span className="text-sm tracking-widest text-teal-300">CANDLEFISH AI</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/70">
          <span>Confidential • Family Access Only</span>
        </div>
      </div>
    </header>
  )
}


