import React from 'react'

export function Sidebar(): JSX.Element {
  return (
    <nav className="rounded-xl border border-white/10 bg-white/5 p-4">
      <ul className="space-y-2 text-sm">
        <li className="text-white/60">Navigation</li>
        <li>
          <a className="block rounded-lg px-3 py-2 hover:bg-white/10" href="#docs">Documents</a>
        </li>
        <li>
          <a className="block rounded-lg px-3 py-2 hover:bg-white/10" href="#legal">Legal</a>
        </li>
        <li>
          <a className="block rounded-lg px-3 py-2 hover:bg-white/10" href="#credits">Shadow Credits</a>
        </li>
        <li>
          <a className="block rounded-lg px-3 py-2 hover:bg-white/10" href="#governance">Governance</a>
        </li>
      </ul>
    </nav>
  )
}


