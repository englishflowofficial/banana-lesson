import { useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookIcon,
  ChartIcon,
  HomeIcon,
  SpeakerIcon,
  SparklesIcon,
} from './icons'
import { useSoundPreference } from '../hooks/useAudio'
import { primeAudio } from '../lib/audio'

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/lessons', label: 'Lessons', icon: BookIcon, end: false },
  { to: '/progress', label: 'Progress', icon: ChartIcon, end: false },
]

export function BananaMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-banana-600 bg-banana-400 ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
        <path
          d="M9 6c-1.1 0-2 .9-2 2 0 8.4 6.4 16.7 15.2 19.3 2.3.7 4.4-1.3 4.4-3.3 0-1.1-.8-2.1-1.9-2.4C18 19.4 12.8 13.7 12.8 7.9 12.8 6.6 11.8 6 9 6Z"
          fill="#8A6600"
        />
        <path d="M9.3 8c0 7.4 5.5 14.6 13.2 17.2" stroke="#FFE79A" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/**
 * App frame: skip link, header navigation, sound preference and the footer.
 * Every page renders inside this, which is what keeps navigation, focus styles
 * and the sound setting consistent across the app.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useSoundPreference()
  const location = useLocation()

  // Browsers only allow audio after a gesture; the first click arms it.
  useEffect(() => {
    const arm = () => primeAudio()
    window.addEventListener('pointerdown', arm, { once: true })
    window.addEventListener('keydown', arm, { once: true })
    return () => {
      window.removeEventListener('pointerdown', arm)
      window.removeEventListener('keydown', arm)
    }
  }, [])

  // Announce route changes and move focus to the top of the new page.
  useEffect(() => {
    const main = document.getElementById('main')
    main?.focus()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:font-extrabold focus:text-cream-50"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-cream-300/70 bg-cream-50/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-5 sm:py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 rounded-2xl py-1 pr-2 text-ink-900 no-underline"
            aria-label="Action English home"
          >
            <BananaMark />
            <span className="hidden text-lg leading-tight font-extrabold sm:block">
              Action English
            </span>
          </NavLink>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav aria-label="Main navigation">
              <ul className="m-0 flex list-none items-center gap-1 p-0 sm:gap-1.5">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `flex min-h-11 items-center gap-1.5 rounded-full border-2 px-3 py-2 text-xs font-extrabold transition-colors sm:px-3.5 sm:text-sm ${
                          isActive
                            ? 'border-banana-500 bg-banana-100 text-banana-700'
                            : 'border-transparent text-ink-600 hover:bg-cream-200 hover:text-ink-900'
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span className="sr-only sm:not-sr-only">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-pressed={soundEnabled}
              className="grid h-11 w-11 place-items-center rounded-full border-2 border-cream-300 bg-white text-ink-600 transition-colors hover:border-banana-400 hover:text-ink-900"
              title={soundEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
            >
              <SpeakerIcon size={18} />
              <span className="sr-only">
                {soundEnabled ? 'Sound effects are on' : 'Sound effects are off'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <footer className="mt-16 border-t border-cream-300 bg-cream-100/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 flex items-center gap-2">
            <SparklesIcon size={18} className="text-banana-600" />
            Every animation is drawn in code — no videos, nothing to download.
          </p>
          <p className="m-0">
            Progress is stored only in your browser.{' '}
            <NavLink to="/progress" className="font-extrabold text-lagoon-600 hover:text-lagoon-700">
              See your progress
            </NavLink>
          </p>
        </div>
      </footer>
    </div>
  )
}
