import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const PlayIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
  </Base>
)

export const PauseIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1.4" fill="currentColor" stroke="none" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1.4" fill="currentColor" stroke="none" />
  </Base>
)

export const ReplayIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12a8 8 0 1 1-2.7-6" />
    <path d="M20 4v5h-5" />
  </Base>
)

export const StepBackIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 5.5v13L6 12z" fill="currentColor" stroke="none" />
    <path d="M5 5v14" />
  </Base>
)

export const StepForwardIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 5.5v13l9-6.5z" fill="currentColor" stroke="none" />
    <path d="M19 5v14" />
  </Base>
)

export const SpeakerIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6" />
    <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Base>
)

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </Base>
)

export const CrossIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5" />
    <path d="M11 6l-6 6 6 6" />
  </Base>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Base>
)

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Base>
)

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </Base>
)

export const BookIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" />
    <path d="M17 7.5h2V20h-2" />
    <path d="M8 8.5h6M8 12h6" />
  </Base>
)

export const ChartIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h16" />
    <path d="M7 20V11" />
    <path d="M12 20V5" />
    <path d="M17 20v-6" />
  </Base>
)

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.6" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Base>
)

export const TrophyIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 4.5h8v4.5a4 4 0 0 1-8 0z" />
    <path d="M8 5.5H5.5A2.5 2.5 0 0 0 8 10" />
    <path d="M16 5.5h2.5A2.5 2.5 0 0 1 16 10" />
    <path d="M12 13v3.5" />
    <path d="M8.5 19.5h7" />
  </Base>
)

export const FlameIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5c3.5 4 5.5 6 5.5 9a5.5 5.5 0 1 1-11 0c0-1.6.6-2.9 1.8-4.3.5 1.4 1.3 2 2.2 2 0-2.4.5-4.3 1.5-6.7z" />
  </Base>
)

export const SparklesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
    <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </Base>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 5.5 15.5 12 9 18.5" />
  </Base>
)

export const LightbulbIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 17.5a5.5 5.5 0 1 1 5 0v1.2a1.3 1.3 0 0 1-1.3 1.3h-2.4a1.3 1.3 0 0 1-1.3-1.3z" />
    <path d="M10 21h4" />
  </Base>
)

export const LeafIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4c0 8-5 13-12 13a4 4 0 0 1 0-3C10 8 14 5 20 4z" />
    <path d="M8 20c1-4 3-7 6-9" />
  </Base>
)

export const MotionIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 12h4l2.5-6 3 12 2.5-6H21" />
  </Base>
)
