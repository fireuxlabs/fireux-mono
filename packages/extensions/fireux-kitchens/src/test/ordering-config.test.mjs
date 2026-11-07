import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../config/module/runtime-config.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const configure = compileFunction(
  `${stripTypeScriptTypes(source)}; return configureOrdering`,
  ['OrderChannels']
)(['pos', 'kiosk', 'website', 'app', 'api'])
const fixture = () => ({ options: { runtimeConfig: { public: {} } } })
test('ordering channels stay opt-in and preserve the existing runtime contract', () => {
  const nuxt = fixture()
  configure(nuxt)
  assert.equal(nuxt.options.runtimeConfig.public.ordering, undefined)
  configure(nuxt, { channels: ['pos', 'website', 'website'] })
  assert.deepEqual(nuxt.options.runtimeConfig.public.ordering, {
    channels: ['pos', 'website'],
  })
  configure(nuxt, { channels: [] })
  assert.deepEqual(nuxt.options.runtimeConfig.public.ordering.channels, [])
})
test('invalid ordering configuration fails before enabling any channels', () => {
  for (const ordering of [
    null,
    {},
    { channels: 'website' },
    { channels: ['unknown'] },
  ]) {
    const nuxt = fixture()
    assert.throws(() => configure(nuxt, ordering), /supported Order channels/)
    assert.equal(nuxt.options.runtimeConfig.public.ordering, undefined)
  }
})
