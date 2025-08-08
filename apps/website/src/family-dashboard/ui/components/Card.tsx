import React from 'react'

type Props = React.PropsWithChildren<{
  title?: string
  className?: string
  hover?: boolean
  interactive?: boolean
}>

export function Card({ title, className, children, hover = false, interactive = false }: Props): JSX.Element {
  const baseClasses = `
    rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm
    transition-all duration-300 ease-out
    shadow-lg shadow-black/20
  `

  const hoverClasses = hover || interactive ? `
    hover:bg-white/8 hover:border-white/20 hover:shadow-xl hover:shadow-black/30
    hover:-translate-y-0.5 hover:scale-[1.02]
  ` : ''

  const interactiveClasses = interactive ? `
    cursor-pointer focus-within:ring-2 focus-within:ring-teal-500/50
    focus-within:border-teal-500/50
  ` : ''

  return (
    <section className={`${baseClasses} ${hoverClasses} ${interactiveClasses} ${className || ''}`}>
      {title ? (
        <div className="border-b border-white/10 px-4 py-3 text-sm text-white/80 font-medium bg-white/[0.02]">
          {title}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  )
}
