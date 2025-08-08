import React from 'react'
import { Card } from './Card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-white/70 mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 text-white/70 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DashboardErrorBoundary
