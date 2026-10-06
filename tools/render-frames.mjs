/**
 * Render storyboard frames of every lesson animation to PNG.
 *
 * Usage:
 *   node tools/render-frames.mjs <outDir> [sceneKey ...]
 *
 * Optional dependency (not required to build or run the app):
 *   npm i -D @resvg/resvg-js   # or point RESVG_PATH at an installed copy
 *
 * Why this exists: the animations are pure functions of their timeline, so a
 * designer or reviewer can eyeball any frame of any lesson without a browser.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const outDir = process.argv[2] ?? path.join(root, 'storyboard')
const wanted = process.argv.slice(3)

let Resvg
try {
  ;({ Resvg } = await import(process.env.RESVG_PATH ?? '@resvg/resvg-js'))
} catch {
  console.error(
    'Resvg is not installed. Run `npm i -D @resvg/resvg-js`, or set RESVG_PATH to an installed copy.',
  )
  process.exit(1)
}

const server = await createServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const mod = await server.ssrLoadModule('/tools/sceneFrames.tsx')
const keys = wanted.length ? wanted : mod.animationKeys
const steps = [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88, 1]

fs.mkdirSync(outDir, { recursive: true })

for (const key of keys) {
  for (const t of steps) {
    const svg = mod.sceneFrameSvg(key, t, 720)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 560 }, background: '#FFFFFF' })
    const png = resvg.render().asPng()
    const file = path.join(outDir, `${key}-${String(Math.round(t * 100)).padStart(3, '0')}.png`)
    fs.writeFileSync(file, png)
  }
  console.log(`rendered ${key}`)
}

await server.close()
