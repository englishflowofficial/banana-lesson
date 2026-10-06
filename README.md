# Action English — Banana Lesson

An interactive English-learning web app where you **watch a short animation of an everyday
action**, choose the correct English phrase from four options, hear it pronounced and read an
example sentence.

**Live app:** <https://englishflowofficial.github.io/banana-lesson/>

The flagship lesson shows two hands **peeling a banana** — an original, fully programmatic SVG
animation (no video files, no stock footage, nothing copyrighted).

---

## What is in here

| Area | What it does |
| --- | --- |
| **Home** | Hero with a live animation preview, how-it-works, categories, recent progress |
| **Lesson player** | Animation + replay/pause, four answer cards, instant feedback, pronunciation, example sentence, previous/next lesson |
| **Lesson library** | Search, filter by category / CEFR level / difficulty / completion, locked and completed states |
| **Progress** | Completed lessons, accuracy, current streak, best streak, per-category progress, recently learned phrases |
| **Storyboard** | `/storyboard` — QA tool that renders every animation frame-by-frame for design review |

Six complete lessons ship in the first release: peeling a banana, pouring water, brushing your
teeth, slicing bread, tying your shoes and watering a plant.

## Tech stack

- **React 18 + TypeScript (strict)** with **Vite 6**
- **Tailwind CSS v4** with a small in-repo design-token theme
- **React Router (hash routing)** so every deep link works on GitHub Pages
- **Zero backend**, zero API keys. Progress lives in `localStorage`; sound is synthesised with the
  Web Audio API; pronunciation uses the browser's speech synthesis
- **Vitest + Testing Library** for unit, content-contract and full-flow tests
- **GitHub Actions** builds, tests and deploys to GitHub Pages on every push to `main`

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173/banana-lesson/
npm run test       # unit + integration tests
npm run lint
npm run build      # type-check + production bundle in dist/
npm run preview    # serve the production build
```

## Architecture

```
src/
  animations/
    engine/            # the reusable motion system
      geometry.ts      # Bézier maths, contour resampling & morphing, ribbons
      Hand.tsx         # one parameterised vector hand used by every scene
      primitives.tsx   # Ink (any shape), Blob, Sparkle, SceneBackdrop
      theme.ts         # shared illustration palette
      useSceneClock.ts # rAF timeline producing a normalised 0..1 progress value
    scenes/            # one component per action, all pure functions of `t`
    SceneView.tsx      # player: animation + controls + reduced-motion handling
  data/
    lessons/           # lesson content, one module per lesson
    categories.ts      # category and level metadata
  lib/
    progress.ts        # progress model, pure reducers, selectors, persistence
    audio.ts           # synthesised success / error cues (Web Audio)
    speech.ts          # speech-synthesis wrapper
  hooks/               # progress context, lesson session, audio preferences
  components/          # shared UI (cards, buttons, answer cards, shell)
  pages/               # Home, Lesson, Library, Progress, Storyboard, 404
tools/
  sceneFrames.tsx      # renders any animation frame to a static SVG
  render-frames.mjs    # CLI: writes storyboard PNGs (optional dev dependency)
```

### The animation system

Every scene is a **pure function of a normalised timeline position `t`**:

```ts
export const BananaPeelScene = memo(function BananaPeelScene({ t, uid }: SceneProps) { … })
```

That single decision gives the app:

- pause, replay and frame-by-frame stepping for free;
- a **reduced-motion** mode that renders one meaningful finished pose instead of motion;
- testability — a test renders every scene at nine timeline positions and asserts that no path
  ever contains `NaN`;
- reviewability — `node tools/render-frames.mjs ./storyboard` writes a PNG storyboard of every
  scene without a browser.

Scenes are built from geometry helpers rather than hand-authored path strings, so shapes genuinely
morph: the banana's peel sections are authored in a "closed" pose and a "hanging" pose and the two
contours are interpolated, which is what makes the peel fold down the way it does.

### The lesson engine

Lesson content is data, kept completely separate from presentation:

```ts
export interface Lesson {
  id, slug, title, targetPhrase, question,
  answerChoices, correctAnswer, mistakeHints?,
  exampleSentence, explanation,
  animationType,      // key into the scene registry
  audioText, altText, caption,
  level, category, difficulty, tags, order
}
```

Adding a lesson means dropping a file into `src/data/lessons/` and adding one line to the index —
the player, library, search, progress tracking and unlocking all read from the catalogue, so the
same code scales from six lessons to thousands. `validateLesson()` enforces the content contract
(four distinct options, the answer present, alt text, tags, ordering) in development and in tests.

## Accessibility

- Semantic landmarks, one `h1` per page, a skip link, and a visible focus ring everywhere
- Answer feedback never relies on colour alone: icons, letter badges and text carry it too
- `prefers-reduced-motion` is respected automatically, and can also be toggled per learner
- The animation is exposed as `role="img"` with a `<title>` and a written `<desc>`
- Keyboard support: full tab order, `1`–`4` to answer, `Enter` to continue, animation stepper
- Colour pairs were chosen to meet WCAG AA contrast for body text, icons and boundaries

## Deployment

`.github/workflows/deploy.yml` runs lint → type-check → tests → build → deploy on every push to
`main`, and can also be triggered manually. The app is built with `base: '/banana-lesson/'` so all
asset URLs resolve correctly under the project Pages URL.

One-time repository setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## License

Application code and all animations are original work created for this project.
