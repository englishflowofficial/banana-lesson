import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

// jsdom does not implement these browser APIs that the app touches.
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

if (!('speechSynthesis' in window)) {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] },
  })
}

if (!('SpeechSynthesisUtterance' in window)) {
  class UtteranceStub {
    text: string
    lang = ''
    rate = 1
    pitch = 1
    voice: unknown = null
    constructor(text: string) {
      this.text = text
    }
  }
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: UtteranceStub,
  })
}
