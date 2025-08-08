// React import not needed with modern JSX transform

export function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/70 shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/25" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white/20 backdrop-blur-sm animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wider text-white">CANDLEFISH AI</span>
            <span className="text-xs text-teal-300 tracking-wide hidden sm:block">Family Dashboard</span>
          </div>
        </div>

        {/* Center navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-1">
          <a href="#docs" className="px-3 py-2 text-sm text-white/70 hover:text-teal-300 hover:bg-white/5 rounded-lg transition-all duration-200">
            Documents
          </a>
          <a href="#legal" className="px-3 py-2 text-sm text-white/70 hover:text-teal-300 hover:bg-white/5 rounded-lg transition-all duration-200">
            Triggers
          </a>
          <a href="#credits" className="px-3 py-2 text-sm text-white/70 hover:text-teal-300 hover:bg-white/5 rounded-lg transition-all duration-200">
            Credits
          </a>
          <a href="#governance" className="px-3 py-2 text-sm text-white/70 hover:text-teal-300 hover:bg-white/5 rounded-lg transition-all duration-200">
            Governance
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-300 font-medium">Confidential</span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
