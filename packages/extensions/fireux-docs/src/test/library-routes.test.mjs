import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))

test('native Docs routes and generated data keep the full inventory development-only', () => {
  const output = mkdtempSync(join(tmpdir(), 'fireux-library-'))
  try {
    const result = execFileSync(process.execPath, ['--input-type=module'], {
      cwd: join(root, 'projects/fireux/fireux-app'),
      env: { ...process.env, CI: 'true', NUXT_TELEMETRY_DISABLED: '1' },
      encoding: 'utf8',
      timeout: 120000,
      input: `
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadNuxt, build } from ${JSON.stringify(import.meta.resolve('nuxt'))}
for (const dev of [false, true]) {
  const output = join(${JSON.stringify(output)}, String(dev))
  const nuxt = await loadNuxt({ cwd: process.cwd(), ready: true, overrides: { dev, _prepare: true, buildDir: output, telemetry: false, devtools: { enabled: false } } })
  try {
    await build(nuxt)
    const flatten = (pages) => pages.flatMap(page => [page, ...flatten(page.children || [])])
    const pages = flatten(nuxt.apps.default.pages)
    assert.ok(pages.some(page => page.path === '/docs/components'))
    const internal = pages.filter(page => page.file?.includes('/pages/dev/core-components/'))
    assert.equal(internal.length, dev ? 2 : 0)
    const inventory = readFileSync(join(output, 'fireux-core-inventory.ts'), 'utf8')
    if (dev) assert.ok(inventory.includes('FireLayoutsDashboardProfileButton'))
    else assert.equal(inventory.trim(), 'export default []')
    const library = readFileSync(join(output, 'fireux-public-components.ts'), 'utf8')
    assert.ok(library.includes('FireState'))
    assert.equal(library.includes('FireLayoutsDashboardProfileButton'), false)
    assert.equal(library.includes('app/components/InitializationGate.vue'), false)
    const detail = readFileSync(${JSON.stringify(join(root, 'packages/extensions/fireux-docs/src/runtime/pages/docs/components/core/[id].vue'))}, 'utf8')
    assert.ok(detail.includes('#build/fireux-public-components'))
    assert.equal(detail.includes('#build/fireux-core-inventory'), false)
  } finally { await nuxt.close() }
}
console.log('Library boundaries passed')
`,
    })
    assert.match(result, /Library boundaries passed/)
  } finally {
    rmSync(output, { recursive: true, force: true })
  }
})
