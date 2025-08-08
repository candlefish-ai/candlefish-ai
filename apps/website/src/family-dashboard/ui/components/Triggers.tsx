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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">Trigger Conditions</h2>
        <div className="text-sm text-white/60">
          {loaded && items.length > 0 && `${items.length} conditions`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
        {(items.length ? items : loaded ? [] : [{ label: 'Loading…', status: '' }]).map((t) => (
          <Card key={t.label} hover>
            <div className="space-y-3">
              <div className="text-sm text-white/70 font-medium">
                {t.label}
              </div>
              <div className={`text-lg font-semibold ${
                !t.status || t.status === 'Loading…'
                  ? 'text-white/50'
                  : t.status.toLowerCase().includes('active') || t.status.toLowerCase().includes('triggered')
                    ? 'text-red-400'
                    : t.status.toLowerCase().includes('inactive') || t.status.toLowerCase().includes('not triggered')
                      ? 'text-green-400'
                      : 'text-white'
              }`}>
                {t.status || 'No status available'}
              </div>

              {t.status && t.status !== 'Loading…' && (
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  t.status.toLowerCase().includes('active') || t.status.toLowerCase().includes('triggered')
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : t.status.toLowerCase().includes('inactive') || t.status.toLowerCase().includes('not triggered')
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-white/10 text-white/70 border border-white/20'
                }`}>
                  {t.status.toLowerCase().includes('active') || t.status.toLowerCase().includes('triggered')
                    ? 'Active'
                    : t.status.toLowerCase().includes('inactive') || t.status.toLowerCase().includes('not triggered')
                      ? 'Inactive'
                      : 'Pending'
                  }
                </div>
              )}
            </div>
          </Card>
        ))}

        {loaded && items.length === 0 && (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-8 text-white/60">
                <div className="text-lg mb-2">No trigger conditions</div>
                <div className="text-sm">Trigger conditions will appear here when available.</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
