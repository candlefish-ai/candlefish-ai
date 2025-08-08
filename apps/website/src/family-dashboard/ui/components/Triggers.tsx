import React from 'react'
import { Card } from './Card'

type Trigger = { label: string; status: string }

export function Triggers(): JSX.Element {
  const [items, setItems] = React.useState<Trigger[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    fetch('/.netlify/functions/family-data', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.triggers)) setItems(data.triggers)
      })
      .finally(() => setLoaded(true))
  }, [])

  return (
    <section id="legal" aria-label="Trigger conditions" className="space-y-4">
      <h2 className="text-2xl font-medium">Trigger Conditions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(items.length ? items : loaded ? [] : [{ label: 'Loading…', status: '' }]).map((t) => (
          <Card key={t.label}>
            <div className="text-sm text-white/70">{t.label}</div>
            <div className="mt-1 text-lg font-medium">{t.status}</div>
          </Card>
        ))}
      </div>
    </section>
  )
}


