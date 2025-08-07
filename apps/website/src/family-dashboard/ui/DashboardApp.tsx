import React from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { DocumentGrid } from './components/DocumentGrid'
import { InsightsBar } from './components/InsightsBar'
import { ShadowCredits } from './components/ShadowCredits'
import { Triggers } from './components/Triggers'
import { Governance } from './components/Governance'

export function DashboardApp(): JSX.Element {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="mx-auto max-w-[1400px] px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          <aside>
            <Sidebar />
          </aside>
          <main className="space-y-8">
            <InsightsBar />
            <DocumentGrid />
            <Triggers />
            <ShadowCredits />
            <Governance />
          </main>
        </div>
      </div>
    </div>
  )
}


