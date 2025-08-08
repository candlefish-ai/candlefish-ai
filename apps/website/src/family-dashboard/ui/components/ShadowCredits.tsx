import React from 'react'
import { Card } from './Card'

type CreditRow = { person: string; hours: number; rate: number; quarter: string }

export function ShadowCredits(): JSX.Element {
  const [rows, setRows] = React.useState<CreditRow[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    fetch('/.netlify/functions/family-data', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.credits)) setRows(data.credits)
      })
      .finally(() => setLoaded(true))
  }, [])

  return (
    <section id="credits" aria-label="Shadow credits" className="space-y-4">
      <h2 className="text-2xl font-medium">Shadow Credits</h2>
      <Card className="p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Person</th>
              <th className="px-4 py-3 text-left font-medium">Quarter</th>
              <th className="px-4 py-3 text-right font-medium">Hours</th>
              <th className="px-4 py-3 text-right font-medium">Rate</th>
              <th className="px-4 py-3 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {(rows.length ? rows : loaded ? [] : [{ person: 'Loading…', hours: 0, rate: 0, quarter: '' } as CreditRow]).map((row, idx) => {
              const value = row.hours * row.rate
              return (
                <tr key={row.person + idx} className="odd:bg-white/0 even:bg-white/[0.02]">
                  <td className="px-4 py-3">{row.person}</td>
                  <td className="px-4 py-3">{row.quarter}</td>
                  <td className="px-4 py-3 text-right">{row.hours}</td>
                  <td className="px-4 py-3 text-right">${row.rate.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${value.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </section>
  )
}


