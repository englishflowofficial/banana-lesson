import { SpeakerIcon } from './icons'
import { useSpeech } from '../hooks/useAudio'

interface Props {
  /** Text to pronounce. Defaults to the lesson phrase. */
  text: string
  /** What the button says out loud, for screen readers. */
  label?: string
  variant?: 'solid' | 'quiet'
  className?: string
}

/**
 * Pronunciation button. Uses the browser's speech synthesis, and degrades to a
 * clear explanation when the browser cannot speak.
 */
export function SpeakButton({ text, label, variant = 'solid', className = '' }: Props) {
  const { supported, speaking, say } = useSpeech()

  if (!supported) {
    return (
      <p className={`m-0 text-sm font-semibold text-ink-400 ${className}`}>
        Your browser cannot play the pronunciation. The phrase is written above.
      </p>
    )
  }

  const styles =
    variant === 'solid'
      ? 'border-lagoon-500 bg-lagoon-50 text-lagoon-700 hover:bg-lagoon-100'
      : 'border-cream-300 bg-white text-ink-700 hover:border-lagoon-500 hover:bg-lagoon-50'

  return (
    <button
      type="button"
      onClick={() => say(text)}
      aria-label={label ?? `Hear how to say “${text}”`}
      className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-extrabold transition-colors active:translate-y-px ${styles} ${
        speaking ? 'animate-pulse' : ''
      } ${className}`}
    >
      <SpeakerIcon size={18} />
      {speaking ? 'Playing…' : 'Hear it'}
    </button>
  )
}
