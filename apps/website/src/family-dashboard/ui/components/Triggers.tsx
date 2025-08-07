import React from 'react'
import { Card } from './Card'

const triggers = [
  { label: 'Both leave MS employment', status: 'Pending' },
  { label: '$2M ARR', status: 'In Progress' },
  { label: '$10M acquisition offer', status: 'Open' },
  { label: 'Jan 1, 2027', status: 'Time-based' },
]

export function Triggers(): JSX.Element {
  return (
    <section id="legal" aria-label="Trigger conditions" className="space-y-4">
      <h2 className="text-2xl font-medium">Trigger Conditions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {triggers.map((t) => (
          <Card key={t.label}>
            <div className="text-sm text-white/70">{t.label}</div>
            <div className="mt-1 text-lg font-medium">{t.status}</div>
          </Card>
        ))}
      </div>
    </section>
  )
}


