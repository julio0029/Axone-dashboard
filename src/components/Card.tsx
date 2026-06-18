import type { ReactNode } from 'react'

export function Card({
  title,
  subtitle,
  right,
  children,
  className = '',
  bodyClass = '',
}: {
  title?: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
}) {
  return (
    <section className={`ax-card ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-ax-border/70">
          <div>
            {title && <h2 className="text-ax-text font-display text-[15px] tracking-wide">{title}</h2>}
            {subtitle && <p className="text-ax-muted text-xs mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className={`p-5 ${bodyClass}`}>{children}</div>
    </section>
  )
}
