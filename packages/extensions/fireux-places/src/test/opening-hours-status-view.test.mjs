import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import * as vue from 'vue'
import { parse, compileScript } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import ts from 'typescript'
import { readOpeningHoursStatus } from '../runtime/place/utils/opening-hours-status.ts'

const { descriptor } = parse(readFileSync(new URL('../runtime/place/components/OpeningHours/Status.vue', import.meta.url), 'utf8'))
const compiled = compileScript(descriptor, { id: 'venue-hours-test', inlineTemplate: true })
const script = ts.transpileModule(compiled.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const place = { timezone: 'Europe/Zurich', business_hours: { windows: [
  { days: ['friday'], open: '08:00', close: '13:00' },
  { days: ['friday'], open: '16:00', close: '23:00' },
] } }
async function render(at, overrides = {}) {
  const exports = {}
  compileFunction(script, ['require', 'exports'])(id => {
    if (id === 'vue') return vue
    if (id === '#imports') return { useState: () => vue.ref(Date.parse(at)) }
    return { readOpeningHoursStatus }
  }, exports)
  const app = vue.createSSRApp(exports.default, { place: { ...place, ...overrides } })
  app.component('UIcon', { render: () => null })
  return (await renderToString(app)).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
test('venue status explains midday reopening without implying order availability', async () => {
  const morning = await render('2026-09-18T10:59:00Z')
  assert.match(morning, /Open until 13:00 · Reopens today at 16:00/)
  assert.match(morning, /Today: 08:00–13:00 · 16:00–23:00/)
  assert.doesNotMatch(morning, /[Ss]erving|[Oo]rder/)
  assert.match(await render('2026-09-18T11:00:00Z'), /Closed now · Opens today at 16:00/)
  const evening = await render('2026-09-18T14:00:00Z')
  assert.match(evening, /Open until 23:00/)
  assert.doesNotMatch(evening, /Reopens/)
})
test('unknown hours do not claim closure and non-physical venues omit status', async () => {
  assert.match(await render('2026-09-18T10:00:00Z', { timezone: undefined }), /Venue hours unavailable/)
  assert.doesNotMatch(await render('2026-09-18T10:00:00Z', { timezone: undefined }), /Closed now/)
  assert.equal(await render('2026-09-18T10:00:00Z', { place_type: 'non_physical' }), '')
})
