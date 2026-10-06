import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, ChevronRightIcon, CrossIcon, LockIcon } from './icons'

/* -------------------------------------------------------------------------- */
/*  Small shared building blocks                                              */
/* -------------------------------------------------------------------------- */

export function Pill({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'banana' | 'leaf' | 'berry' | 'lagoon'
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-cream-200 text-ink-600 border-cream-300',
    banana: 'bg-banana-100 text-banana-700 border-banana-200',
    leaf: 'bg-leaf-100 text-leaf-700 border-leaf-200',
    berry: 'bg-berry-100 text-berry-700 border-berry-200',
    lagoon: 'bg-lagoon-100 text-lagoon-700 border-lagoon-100',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({
  value,
  max,
  label,
  tone = 'banana',
  className = '',
}: {
  value: number
  max: number
  label: string
  tone?: 'banana' | 'leaf' | 'lagoon'
  className?: string
}) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max))
  const tones = { banana: 'bg-banana-500', leaf: 'bg-leaf-500', lagoon: 'bg-lagoon-500' }
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-cream-300 ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={`${value} of ${max}`}
    >
      <div
        className={`h-full rounded-full ${tones[tone]} transition-[width] duration-500 ease-out-soft`}
        style={{ width: `${Math.max(ratio * 100, ratio > 0 ? 6 : 0)}%` }}
      />
    </div>
  )
}

export function ProgressRing({
  ratio,
  size = 132,
  label,
  sublabel,
}: {
  ratio: number
  size?: number
  label: string
  sublabel?: string
}) {
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, ratio))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EFDCC2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F5C518"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl leading-none font-extrabold text-ink-900">{label}</div>
        {sublabel && <div className="mt-1 text-xs font-bold text-ink-500">{sublabel}</div>}
      </div>
    </div>
  )
}

export function StatCard({
  icon,
  value,
  label,
  hint,
  tone = 'banana',
}: {
  icon: ReactNode
  value: string
  label: string
  hint?: string
  tone?: 'banana' | 'leaf' | 'lagoon' | 'berry'
}) {
  const tones = {
    banana: 'bg-banana-100 text-banana-700',
    leaf: 'bg-leaf-100 text-leaf-700',
    lagoon: 'bg-lagoon-100 text-lagoon-700',
    berry: 'bg-berry-100 text-berry-700',
  }
  return (
    <div className="card-surface flex items-start gap-3 p-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}>
        {icon}
      </span>
      <div>
        <div className="text-2xl leading-none font-extrabold text-ink-900">{value}</div>
        <div className="mt-1 text-sm font-bold text-ink-600">{label}</div>
        {hint && <div className="mt-0.5 text-xs font-semibold text-ink-400">{hint}</div>}
      </div>
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  level = 2,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  /** Heading level — pages use 1 for their single top-level heading. */
  level?: 1 | 2 | 3
}) {
  const Heading = (level === 1 ? 'h1' : level === 3 ? 'h3' : 'h2') as 'h1' | 'h2' | 'h3'
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="m-0 text-xs font-extrabold tracking-widest text-ink-400 uppercase">{eyebrow}</p>
        )}
        <Heading className="mt-1 text-2xl sm:text-3xl">{title}</Heading>
        {description && <p className="mt-2 text-ink-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  to: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  className?: string
}) {
  const variants = {
    primary:
      'bg-banana-500 text-ink-900 border-banana-600 hover:bg-banana-400 active:translate-y-px shadow-pop',
    secondary:
      'bg-white text-ink-800 border-cream-300 hover:bg-cream-100 hover:border-banana-400 active:translate-y-px shadow-pop',
    ghost: 'bg-transparent text-ink-700 border-transparent hover:bg-cream-200',
  }
  const sizes = { md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full border-2 font-extrabold transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="card-surface px-6 py-10 text-center">
      <h3 className="text-lg">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-ink-600">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Lesson status bits                                                        */
/* -------------------------------------------------------------------------- */

export function CompletedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-leaf-100 px-2.5 py-1 text-xs font-extrabold text-leaf-700 ${className}`}
    >
      <CheckIcon size={14} /> Done
    </span>
  )
}

export function LockedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1 text-xs font-extrabold text-ink-500 ${className}`}
    >
      <LockIcon size={14} /> Locked
    </span>
  )
}

export function ArrowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-extrabold text-lagoon-600 hover:text-lagoon-700"
    >
      {children}
      <ChevronRightIcon size={16} />
    </Link>
  )
}

export function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckIcon size={20} className="text-leaf-600" />
  ) : (
    <CrossIcon size={20} className="text-berry-600" />
  )
}
