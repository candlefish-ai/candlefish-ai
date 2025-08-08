// React import not needed with modern JSX transform

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'teal' | 'white' | 'blue'
  className?: string
  text?: string
}

export function LoadingSpinner({
  size = 'medium',
  color = 'teal',
  className = '',
  text = 'Loading...'
}: LoadingSpinnerProps): JSX.Element {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }

  const colorClasses = {
    teal: 'border-teal-400 border-t-transparent',
    white: 'border-white/60 border-t-transparent',
    blue: 'border-blue-400 border-t-transparent'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-2 rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <div className="text-sm text-white/60 animate-pulse">
          {text}
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
