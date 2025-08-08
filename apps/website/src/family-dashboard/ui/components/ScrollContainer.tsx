import React from 'react'

type Props = React.PropsWithChildren<{
  className?: string
  direction?: 'horizontal' | 'vertical' | 'both'
  showScrollbar?: boolean
}>

export function ScrollContainer({
  children,
  className = '',
  direction = 'horizontal',
  showScrollbar = true
}: Props): JSX.Element {
  const scrollClasses = {
    horizontal: 'overflow-x-auto overflow-y-hidden',
    vertical: 'overflow-y-auto overflow-x-hidden',
    both: 'overflow-auto'
  }

  const scrollbarClasses = showScrollbar
    ? 'scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40'
    : 'scrollbar-none'

  return (
    <div
      className={`
        ${scrollClasses[direction]}
        ${scrollbarClasses}
        ${className}
      `}
      role="region"
      tabIndex={0}
      aria-label="Scrollable content"
    >
      {children}
    </div>
  )
}

export default ScrollContainer
