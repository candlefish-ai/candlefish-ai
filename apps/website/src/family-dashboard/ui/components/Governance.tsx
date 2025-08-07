import React from 'react'

export function Governance(): JSX.Element {
  return (
    <section id="governance" aria-label="Governance" className="space-y-4">
      <h2 className="text-2xl font-medium">Governance</h2>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <ul className="list-disc space-y-2 pl-5">
          <li>Daily operations: Pat retains executive authority</li>
          <li>Major decisions: Family vote</li>
          <li>Annual review: December family meeting</li>
          <li>Advisory board: Poppy (legal), CPA, industry expert (TBD)</li>
        </ul>
      </div>
    </section>
  )
}


