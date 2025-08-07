import React from 'react'
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {docs.map((d) => (
          <Card key={d.href}>
            <a href={d.href} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
              <div className="text-sm text-white/60">Confidential</div>
              <div className="mt-1 text-lg font-medium group-hover:text-teal-300">{d.title}</div>
              <div className="mt-1 text-sm text-white/70">{d.desc}</div>
            </a>
          </Card>
        ))}
      </div>
    </section>
  )
}


