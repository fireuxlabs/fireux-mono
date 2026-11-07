import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../../../../', import.meta.url))
test('Misebox native dependencies retain App module options and publish only catalogue names', () => {
  const output = mkdtempSync(join(tmpdir(), 'fireux-app-module-options-'))
  try {
    const proof = execFileSync(process.execPath, ['--input-type=module'], {
      cwd: join(root, 'projects/misebox/misebox-app'),
      env: { ...process.env, CI: 'true', NUXT_TELEMETRY_DISABLED: '1' },
      encoding: 'utf8',
      timeout: 120000,
      input: `
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadNuxt, build } from ${JSON.stringify(import.meta.resolve('nuxt'))}
const output = ${JSON.stringify(output)}
const nuxt = await loadNuxt({ cwd: process.cwd(), ready: true, overrides: { _prepare: true, dev: false, buildDir: output, telemetry: false, devtools: { enabled: false } } })
try {
  assert.deepEqual(nuxt.options.runtimeConfig.public.ordering, { channels: ['pos', 'kiosk', 'website'] })
  assert.equal(nuxt.options.runtimeConfig.public.packageComponents, undefined)
  await build(nuxt)
  const catalogue = readFileSync(join(output, 'fireux-package-components.ts'), 'utf8')
  assert.ok(catalogue.includes('AppAssets'))
  assert.equal(catalogue.includes(${JSON.stringify(root)}), false)
  console.log('Native module options passed')
} finally { await nuxt.close() }
`,
    })
    assert.match(proof, /Native module options passed/)
  } finally {
    rmSync(output, { recursive: true, force: true })
  }
})
