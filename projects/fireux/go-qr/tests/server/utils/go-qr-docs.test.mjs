import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { validatePublicSlug } from '../../../../../../packages/core/fireux-core/src/runtime/utils/slug/validate-public-slug.ts'
import { checkPublicSlugAvailability } from '../../../../../../packages/core/fireux-core/src/runtime/server/utils/slug/checkPublicSlugAvailability.ts'

test('Go QR document paths retain App reservations and local reserved paths', () => {
  const source = readFileSync(
    new URL('../../../server/utils/goQrDocs.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const validate = compileFunction(
    `${stripTypeScriptTypes(source)}; return validateGoQrDocSlug`,
    ['useRuntimeConfig', 'validatePublicSlug']
  )(
    () => ({
      public: { fireux: { reservedRouteKeys: [' Configured-Route '] } },
    }),
    validatePublicSlug
  )
  assert.equal(validate('Configured Route').reason, 'reserved')
  assert.equal(validate('pricing').reason, 'reserved')
  assert.equal(validate('users').reason, 'reserved')
  assert.deepEqual(validate('Venue Guide'), {
    isValid: true,
    slug: 'venue-guide',
  })
})

test('Go QR availability rejects App reservations before reading document existence', async () => {
  const source = readFileSync(
    new URL(
      '../../../server/api/tools/doc/availability.get.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /m, 'return ')
  let reads = 0
  const handler = compileFunction(source, [
    'defineEventHandler',
    'getQuery',
    'useRuntimeConfig',
    'checkPublicSlugAvailability',
    'reservedGoQrDocSlugs',
    'goQrDocRef',
  ])(
    (handler) => handler,
    (event) => event.query,
    () => ({ public: { fireux: { reservedRouteKeys: ['configured-route'] } } }),
    checkPublicSlugAvailability,
    ['pricing'],
    () => ({
      get: async () => {
        reads++
        return { exists: false }
      },
    })
  )
  for (const id of ['Configured Route', 'pricing']) {
    const result = await handler({ query: { id } })
    assert.equal(result.is_valid, false)
    assert.equal(result.available, false)
    assert.equal(result.taken, false)
    assert.match(result.message, /reserved/)
  }
  assert.equal(reads, 0)
  const result = await handler({ query: { id: 'Venue Guide' } })
  assert.equal(result.id, 'venue-guide')
  assert.equal(result.available, true)
  assert.equal(reads, 1)
})
