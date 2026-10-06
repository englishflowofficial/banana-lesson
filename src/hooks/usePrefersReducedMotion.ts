import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the user's reduced-motion preference, and keeps tracking it if they
 * change the OS setting while the tab is open.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches)
    mql.addEventListener('change', onChange)
    setPrefersReduced(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}

/** Lets a component keep its own runtime value in localStorage. */
export function useStoredFlag(key: string, fallback: boolean): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? fallback : raw === 'true'
    } catch {
      return fallback
    }
  })

  const update = (next: boolean) => {
    setValue(next)
    try {
      window.localStorage.setItem(key, String(next))
    } catch {
      /* storage blocked — the toggle still works for this session */
    }
  }

  return [value, update]
}
