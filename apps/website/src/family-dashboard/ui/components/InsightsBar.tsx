import React from 'react'
import { Card } from './Card'

export function InsightsBar(): JSX.Element {
  const items = [
    { label: 'Next Review', value: 'Sep 15, 2025' },
    { label: 'Triggers', value: '4 defined' },
    { label: 'Shadow Credits', value: 'Q3 tracking active' },
  ] as const

  return (
    <section aria-label="Key insights">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((it) => (
          <Card key={it.label}>
            <div className="text-xs text-white/60">{it.label}</div>
            <div className="text-lg font-medium">{it.value}</div>
          </Card>
        ))}
      </div>
    </section>
  )
}


