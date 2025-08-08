// React import not needed with modern JSX transform
import { Card } from './Card'

const docs = [
  {
    title: 'Family Communication Letter (Aug 3, 2025)',
    href: '/docs/privileged/family/candlefish_update_08032025_family.html',
    desc: 'Status, plans, and family communication.'
  },
  {
    title: 'Legal Structure Document (Aug 7, 2025)',
    href: '/docs/privileged/family/candlefish_update_08032025_legal.html',
    desc: 'Ownership, triggers, Shadow Credits policy.'
  },
] as const

export function DocumentGrid(): JSX.Element {
  return (
    <section id="docs" aria-label="Documents" className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-medium">Documents</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.href} hover interactive>
            <a href={d.href} className="group block focus:outline-none">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Confidential
                </div>
              </div>
              <div className="text-lg font-medium group-hover:text-teal-300 transition-colors duration-200 mb-2">
                {d.title}
              </div>
              <div className="text-sm text-white/70 line-clamp-2">
                {d.desc}
              </div>
              <div className="mt-3 text-xs text-teal-400 group-hover:text-teal-300 transition-colors">
                View document →
              </div>
            </a>
          </Card>
        ))}
      </div>
    </section>
  )
}
