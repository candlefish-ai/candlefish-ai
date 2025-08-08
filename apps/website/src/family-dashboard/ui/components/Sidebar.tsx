import React from 'react'

export function Sidebar(): JSX.Element {
  const [activeSection, setActiveSection] = React.useState('')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )

    const sections = document.querySelectorAll('[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const navigationItems = [
    { id: 'docs', label: 'Documents', icon: '📄', count: '2' },
    { id: 'legal', label: 'Triggers', icon: '⚡', count: '4' },
    { id: 'credits', label: 'Shadow Credits', icon: '💰', count: 'Q3' },
    { id: 'governance', label: 'Governance', icon: '⚖️', count: '4' }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-black/20 p-4">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Dashboard Stats</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/60">Last Review</span>
            <span className="text-teal-400">Aug 7, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Active Triggers</span>
            <span className="text-yellow-400">Monitoring</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Family Access</span>
            <span className="text-green-400">Enabled</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-black/20 p-4">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Quick Navigation</h3>
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  })
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeSection === item.id
                    ? 'bg-teal-400/20 text-teal-200'
                    : 'bg-white/10 text-white/50 group-hover:bg-white/20'
                }`}>
                  {item.count}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-black/20 p-4">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            📊 Export Report
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            🔄 Refresh Data
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  )
}
