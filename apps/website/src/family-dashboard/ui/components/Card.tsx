import React from 'react'

type Props = React.PropsWithChildren<{
  title?: string
  className?: string
}>

export function Card({ title, className, children }: Props): JSX.Element {
  return (
    <section className={`rounded-xl border border-white/10 bg-white/5 ${className || ''}`}>
      {title ? (
        <div className="border-b border-white/10 px-4 py-3 text-sm text-white/80">{title}</div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  )
}


