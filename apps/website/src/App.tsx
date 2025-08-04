import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingScreen from './components/LoadingScreen'
import ParticleBackground from './components/ParticleBackground'

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
          {/* WebGL Particle Background */}
          <ParticleBackground />
          
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App