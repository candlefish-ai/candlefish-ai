import React from 'react'
import { Card } from './Card'
import { LoadingSpinner } from './LoadingSpinner'
import { DashboardErrorBoundary } from './DashboardErrorBoundary'

type CreditRow = { person: string; hours: number; rate: number; quarter: string }

export function ShadowCredits(): JSX.Element {
  const [rows, setRows] = React.useState<CreditRow[]>([])
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch('/.netlify/functions/family-data', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
        return r.json()
      })
      .then((data) => {
        if (data && Array.isArray(data.credits)) setRows(data.credits)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoaded(true))
  }, [])

  if (error) {
    return (
      <section id="credits" aria-label="Shadow credits" className="space-y-4">
        <h2 className="text-2xl font-medium">Shadow Credits</h2>
        <Card className="border-red-500/20 bg-red-500/5">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-red-400 font-medium mb-2">Failed to load credit data</div>
            <div className="text-sm text-white/70 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <DashboardErrorBoundary>
    <section id="credits" aria-label="Shadow credits" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">Shadow Credits</h2>
        <div className="text-sm text-white/60">
          {rows.length > 0 && `${rows.length} entries`}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
          <div className="min-w-full">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/70 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Person</th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Quarter</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">Hours</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">Rate</th>
                  <th className="px-4 py-3 text-right font-medium whitespace-nowrap">Value</th>
                </tr>
              </thead>
              <tbody>
                {!loaded ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8">
                      <LoadingSpinner text="Loading shadow credits..." />
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((row, idx) => {
                    const value = row.hours * row.rate
                    return (
                      <tr
                        key={row.person + idx}
                        className="group transition-colors duration-200 hover:bg-white/[0.05] odd:bg-white/0 even:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 whitespace-nowrap group-hover:text-teal-300 transition-colors">
                          {row.person}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white/70">
                          {row.quarter}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-mono">
                          {row.hours.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-mono text-white/80">
                          ${row.rate.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap font-mono font-semibold text-teal-400">
                          ${value.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })
                ) : null}
              </tbody>
            </table>

            {loaded && rows.length === 0 && (
              <div className="p-8 text-center text-white/60">
                <div className="text-lg mb-2">No credit data available</div>
                <div className="text-sm">Shadow credits will appear here when available.</div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
    </DashboardErrorBoundary>
  )
}
