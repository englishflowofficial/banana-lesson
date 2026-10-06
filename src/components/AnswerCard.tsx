import { CheckIcon, CrossIcon } from './icons'

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'muted' | 'revealed'

interface Props {
  index: number
  label: string
  state: AnswerState
  disabled?: boolean
  onSelect: () => void
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * One large tappable answer option.
 *
 * States are never signalled by colour alone: the letter badge, the icon and the
 * text ("Correct" / "Your answer") all carry the same information, which keeps
 * the feedback readable for colour-blind learners and screen-reader users.
 */
export function AnswerCard({ index, label, state, disabled = false, onSelect }: Props) {
  const base =
    'group flex w-full min-h-[76px] items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 text-left text-base font-bold transition-all duration-200'

  const styles: Record<AnswerState, string> = {
    idle: 'border-cream-300 bg-white text-ink-800 shadow-pop hover:border-banana-400 hover:bg-banana-50 active:translate-y-px',
    correct: 'border-leaf-500 bg-leaf-50 text-leaf-900 shadow-pop',
    wrong: 'border-berry-500 bg-berry-50 text-berry-700 shadow-pop',
    muted: 'border-cream-200 bg-cream-50 text-ink-300',
    revealed: 'border-leaf-300 bg-leaf-50/60 text-leaf-700',
  }

  const badge: Record<AnswerState, string> = {
    idle: 'bg-cream-200 text-ink-600 group-hover:bg-banana-200 group-hover:text-banana-700',
    correct: 'bg-leaf-500 text-white',
    wrong: 'bg-berry-500 text-white',
    muted: 'bg-cream-200 text-ink-300',
    revealed: 'bg-leaf-500 text-white',
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === 'correct' || state === 'wrong'}
      className={`${base} ${styles[state]} ${state === 'wrong' ? 'animate-shake' : ''} ${
        state === 'correct' ? 'animate-ring' : ''
      } disabled:cursor-not-allowed`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${badge[state]}`}
        aria-hidden="true"
      >
        {state === 'correct' || state === 'revealed' ? (
          <CheckIcon size={18} />
        ) : state === 'wrong' ? (
          <CrossIcon size={18} />
        ) : (
          LETTERS[index]
        )}
      </span>
      <span className="flex-1">{label}</span>
      {state === 'correct' && <span className="sr-only">Correct answer</span>}
      {state === 'wrong' && <span className="sr-only">Your answer — not correct</span>}
    </button>
  )
}
