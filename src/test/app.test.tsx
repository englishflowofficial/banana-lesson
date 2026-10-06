import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { PROGRESS_KEY, loadProgress } from '../lib/progress'
import { lessons } from '../data/lessons'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('home page', () => {
  it('shows the hero, the call to action and the catalogue', () => {
    renderApp('/')
    expect(
      screen.getByRole('heading', { level: 1, name: /learn english verbs by watching/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start learning|continue learning/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /one action, three quick steps/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /practise by topic/i })).toBeInTheDocument()
  })

  it('renders the flagship animation with an accessible description', () => {
    renderApp('/')
    const figure = screen.getAllByRole('img')[0]
    expect(figure.tagName.toLowerCase()).toBe('svg')
    const describedBy = figure.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy ?? '')?.textContent).toMatch(/banana/i)
  })

  it('exposes replay and pause controls for the animation', () => {
    renderApp('/')
    expect(screen.getAllByRole('button', { name: /replay/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /play|pause/i }).length).toBeGreaterThan(0)
  })
})

describe('lesson library', () => {
  it('lists every lesson and marks the locked ones', () => {
    renderApp('/lessons')
    for (const lesson of lessons) {
      expect(screen.getAllByText(lesson.title).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByText(/locked/i).length).toBeGreaterThan(0)
  })

  it('filters by search text', async () => {
    const user = userEvent.setup()
    renderApp('/lessons')
    const search = screen.getByLabelText(/search lessons/i)
    await user.type(search, 'banana')
    expect(screen.getByRole('status').textContent).toMatch(/1 lesson found/i)
    expect(screen.getByText('Peeling a banana')).toBeInTheDocument()
  })

  it('filters by category through the URL', () => {
    renderApp('/lessons?category=self-care')
    expect(screen.getByRole('status').textContent).toMatch(/2 lessons found/i)
  })

  it('explains when nothing matches', async () => {
    const user = userEvent.setup()
    renderApp('/lessons')
    await user.type(screen.getByLabelText(/search lessons/i), 'zzzz')
    expect(screen.getByText(/no lessons match those filters/i)).toBeInTheDocument()
  })
})

const lesson0Options = ['Peeling a banana', 'Cutting a banana', 'Washing a banana', 'Eating a banana']

describe('lesson player', () => {
  it('shows the question and four answer cards', () => {
    renderApp('/lesson/peeling-a-banana')
    expect(screen.getByRole('heading', { name: /what is this action called/i })).toBeInTheDocument()
    const group = screen.getByRole('group', { name: /answer options/i })
    const options = within(group).getAllByRole('button')
    expect(options).toHaveLength(4)
    // The letter badge is aria-hidden, but it is still part of textContent —
    // so check that each option carries its label.
    expect(
      options.map((option) => {
        const label = lesson0Options[options.indexOf(option)]
        return option.textContent?.includes(label)
      }),
    ).toEqual([true, true, true, true])
  })

  it('explains a wrong answer and lets the learner try again', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')

    await user.click(screen.getByRole('button', { name: /cutting a banana/i }))
    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
    expect(screen.getByText(/a knife cuts/i)).toBeInTheDocument()
    // The correct answer is not revealed yet.
    expect(screen.queryByText(/that’s right/i)).not.toBeInTheDocument()

    const stored = loadProgress()
    expect(stored.lessons[lessons[0].id].completed).toBe(false)
    expect(stored.totals).toEqual({ answered: 1, correct: 0 })

    await user.click(screen.getByRole('button', { name: /try another answer/i }))
    await user.click(screen.getByRole('button', { name: /^peeling a banana$/i }))

    expect(screen.getByText(/that’s right/i)).toBeInTheDocument()
    expect(screen.getByText(lessons[0].exampleSentence)).toBeInTheDocument()
    expect(screen.getByText(lessons[0].explanation)).toBeInTheDocument()

    const afterCorrect = loadProgress()
    expect(afterCorrect.lessons[lessons[0].id].completed).toBe(true)
    expect(afterCorrect.totals).toEqual({ answered: 2, correct: 1 })
  })

  it('saves progress to localStorage', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.click(screen.getByRole('button', { name: /peeling a banana/i }))

    const raw = window.localStorage.getItem(PROGRESS_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw ?? '{}')).toMatchObject({ version: 1 })
    expect(loadProgress().lessons[lessons[0].id].completed).toBe(true)
  })

  it('reveals the answer when the learner asks for it', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.click(screen.getByRole('button', { name: /washing a banana/i }))
    await user.click(screen.getByRole('button', { name: /show me the answer/i }))
    expect(screen.getByText(/the answer is/i)).toBeInTheDocument()
    expect(screen.getByText(lessons[0].exampleSentence)).toBeInTheDocument()
  })

  it('accepts the number keys as shortcuts', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.keyboard('1')
    expect(screen.getByText(/that’s right/i)).toBeInTheDocument()
  })

  it('offers a pronunciation button after answering', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.click(screen.getByRole('button', { name: /eating a banana/i }))
    await user.click(screen.getByRole('button', { name: /try another answer/i }))
    await user.click(screen.getByRole('button', { name: /^peeling a banana$/i }))
    expect(screen.getByRole('button', { name: /hear the phrase/i })).toBeInTheDocument()
  })

  it('blocks a locked lesson and points at the previous one', () => {
    renderApp('/lesson/watering-a-plant')
    expect(screen.getByRole('heading', { name: /is still locked/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /lesson library/i })).toBeInTheDocument()
  })

  it('shows a friendly message for an unknown lesson', () => {
    renderApp('/lesson/not-a-real-lesson')
    expect(screen.getByRole('heading', { name: /could not find that lesson/i })).toBeInTheDocument()
  })

  it('moves to the next lesson once the current one is finished', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.click(screen.getByRole('button', { name: /peeling a banana/i }))
    const next = screen.getByRole('link', { name: /next lesson: pouring water/i })
    expect(next).toHaveAttribute('href', '/lesson/pouring-water')
  })
})

describe('progress page', () => {
  it('invites a brand new learner to start', () => {
    renderApp('/progress')
    expect(screen.getByText(/no answers yet/i)).toBeInTheDocument()
  })

  it('reports completion, accuracy and streak after a lesson', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.click(screen.getByRole('button', { name: /peeling a banana/i }))

    renderApp('/progress')
    expect(screen.getByRole('heading', { name: /how your english is growing/i })).toBeInTheDocument()
    expect(screen.getByText(/17% of the library/i)).toBeInTheDocument()
    expect(screen.getAllByText('1/6').length).toBeGreaterThan(0)
    const accuracy = screen.getByText(/answer accuracy/i).closest('div')?.parentElement?.textContent
    expect(accuracy).toMatch(/100%/)
  })

  it('can reset the saved progress', async () => {
    const user = userEvent.setup()
    renderApp('/lesson/peeling-a-banana')
    await user.click(screen.getByRole('button', { name: /peeling a banana/i }))

    renderApp('/progress')
    await user.click(screen.getByRole('button', { name: /reset my progress/i }))
    await user.click(screen.getByRole('button', { name: /yes, reset everything/i }))
    expect(loadProgress().lessons[lessons[0].id]).toBeUndefined()
  })
})

describe('shell and routing', () => {
  it('renders the main navigation and the skip link', () => {
    renderApp('/')
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(within(nav).getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /lessons/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /progress/i })).toBeInTheDocument()
  })

  it('lets the learner turn sound effects off', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const toggle = screen.getByRole('button', { name: /sound effects are on/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await user.click(toggle)
    expect(screen.getByRole('button', { name: /sound effects are off/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(window.localStorage.getItem('actionEnglish:soundEnabled')).toBe('false')
  })

  it('shows a not-found page for unknown routes', () => {
    renderApp('/nope')
    expect(screen.getByRole('heading', { name: /this page slipped away/i })).toBeInTheDocument()
  })

  it('renders the animation storyboard tool', () => {
    renderApp('/storyboard')
    expect(screen.getByRole('heading', { name: /animation storyboard/i })).toBeInTheDocument()
  })
})

describe('page structure', () => {
  it.each([
    ['/', /learn english verbs/i],
    ['/lessons', /every action lesson in one place/i],
    ['/progress', /how your english is growing/i],
  ])('has exactly one main heading on %s', (path, expected) => {
    renderApp(path)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0].textContent).toMatch(expected)
  })
})
