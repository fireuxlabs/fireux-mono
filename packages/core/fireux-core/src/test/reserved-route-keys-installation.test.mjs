import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { build, loadNuxt } from 'nuxt'
import core from '../module.ts'
import { registerReservedRootRouteKeys } from '../config/module/reserved-route-keys.ts'
import { BASE_RESERVED_ROUTE_KEYS } from '../utils/public-slug-policy.ts'

test('sequential Nuxt prepares isolate root keys, including modules after Core', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fireux-reserved-routes-'))
  const observed = []
  const expected = []
  try {
    for (const order of [
      ['alpha', 'beta'],
      ['beta', 'alpha'],
    ]) {
      for (const name of order) {
        const early = `fixture-${name}-early`
        const late = `fixture-${name}-late`
        const cwd = await mkdtemp(join(root, name + '-'))
        const nuxt = await loadNuxt({
          cwd,
          overrides: {
            _prepare: true,
            dev: false,
            telemetry: false,
            devtools: { enabled: false },
            modules: [
              (_options, nuxt) => registerReservedRootRouteKeys(nuxt, [early]),
              core,
              (_options, nuxt) => registerReservedRootRouteKeys(nuxt, [late]),
            ],
          },
        })
        try {
          await build(nuxt)
          observed.push(
            [
              ...nuxt.options.runtimeConfig.public.fireux.reservedRouteKeys,
            ].sort()
          )
          expected.push([...BASE_RESERVED_ROUTE_KEYS, early, late].sort())
        } finally {
          await nuxt.close()
        }
      }
    }
    assert.deepEqual(observed, expected)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
