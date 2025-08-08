import React from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { DocumentGrid } from './components/DocumentGrid'
import { InsightsBar } from './components/InsightsBar'
import { ShadowCredits } from './components/ShadowCredits'
import { Triggers } from './components/Triggers'
import { Governance } from './components/Governance'

export function DashboardApp(): JSX.Element {
  React.useEffect(() => {
    // Add no-transitions class initially, remove after mount
    document.body.classList.add('no-transitions')
    const timer = setTimeout(() => {
      document.body.classList.remove('no-transitions')
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white antialiased">
      <Header />

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] xl:grid-cols-[320px,1fr] gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-track-white/5 lg:scrollbar-thumb-white/20">
              <Sidebar />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-6 lg:space-y-8">
            {/* Insights at the top */}
            <div className="order-1">
              <InsightsBar />
            </div>

            {/* Documents section */}
            <div className="order-2">
              <DocumentGrid />
            </div>

            {/* Two-column layout for larger screens */}
            <div className="order-3 grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-6 lg:space-y-8">
                <Triggers />
                <Governance />
              </div>

              <div className="xl:sticky xl:top-6 xl:h-fit">
                <ShadowCredits />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  )
}
