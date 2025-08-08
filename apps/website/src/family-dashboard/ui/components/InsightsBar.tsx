// React import not needed with modern JSX transform
import { Card } from './Card'

export function InsightsBar(): JSX.Element {
  const items = [
    {
      label: 'Next Review',
      value: 'Sep 15, 2025',
      icon: '📅',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      description: 'Scheduled family meeting'
    },
    {
      label: 'Triggers',
      value: '4 defined',
      icon: '⚡',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      description: 'Monitoring conditions'
    },
    {
      label: 'Shadow Credits',
      value: 'Q3 tracking active',
      icon: '💰',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      description: 'Current quarter status'
    },
  ] as const

  return (
    <section aria-label="Key insights" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Overview</h2>
        <div className="text-sm text-white/60">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.label} hover className={`border ${it.bgColor.split(' ')[1]} relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-white/60 uppercase tracking-wide">
                  {it.label}
                </div>
                <div className="text-lg">
                  {it.icon}
                </div>
              </div>

              <div className={`text-lg font-semibold mb-1 ${it.color}`}>
                {it.value}
              </div>

              <div className="text-xs text-white/50">
                {it.description}
              </div>
            </div>

            {/* Subtle background gradient */}
            <div className={`absolute inset-0 ${it.bgColor.split(' ')[0]} opacity-50`} />
          </Card>
        ))}
      </div>
    </section>
  )
}
