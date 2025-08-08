// React import not needed with modern JSX transform

export function Governance(): JSX.Element {
  const governanceItems = [
    {
      title: 'Daily Operations',
      description: 'Pat retains executive authority',
      icon: '⚙️',
      status: 'active'
    },
    {
      title: 'Major Decisions',
      description: 'Family vote required',
      icon: '🗳️',
      status: 'active'
    },
    {
      title: 'Annual Review',
      description: 'December family meeting',
      icon: '📆',
      status: 'scheduled'
    },
    {
      title: 'Advisory Board',
      description: 'Poppy (legal), CPA, industry expert (TBD)',
      icon: '👥',
      status: 'pending'
    }
  ]

  return (
    <section id="governance" aria-label="Governance" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">Governance</h2>
        <div className="text-sm text-white/60">
          Structure & Processes
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-black/20 p-6">
        <div className="space-y-4">
          {governanceItems.map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="text-lg mt-0.5">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-white">
                    {item.title}
                  </h3>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'active'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : item.status === 'scheduled'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
