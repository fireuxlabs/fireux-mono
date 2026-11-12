import assert from 'node:assert/strict'
import test from 'node:test'
import { createJiti } from 'jiti'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const jiti = createJiti(import.meta.url)
const { validatePublicSlug, assertPublicSlug } = await jiti.import(
  '../../../runtime/utils/slug/validate-public-slug.ts'
)
const { normalizeSlug } = await jiti.import(
  '../../../runtime/utils/slug/normalize-slug.ts'
)
const { BASE_RESERVED_ROUTE_KEYS, BASE_RESERVED_ROUTE_SEGMENT_KEYS } =
  await jiti.import('../../../utils/public-slug-policy.ts')
const { registerReservedRootRouteKeys, getReservedRootRouteKeys } =
  await jiti.import('../../../config/module/reserved-route-keys.ts')
const { configureFireuxModule } = await jiti.import(
  '../../../config/module/module-wiring.ts'
)

test('fixed root/entity reservations, normalization and error copy retain their scope', () => {
  for (const key of BASE_RESERVED_ROUTE_KEYS.filter(
    (key) => normalizeSlug(key) === key
  ))
    assert.equal(
      validatePublicSlug(key, { reservedScope: 'root' }).reason,
      'reserved'
    )
  for (const key of BASE_RESERVED_ROUTE_SEGMENT_KEYS)
    assert.equal(validatePublicSlug(key).reason, 'reserved')
  assert.equal(validatePublicSlug('users').isValid, true)
  assert.equal(
    validatePublicSlug('new', { reservedScope: 'root' }).isValid,
    true
  )
  assert.equal(
    validatePublicSlug('users', { reservedScope: 'none' }).isValid,
    true
  )
  assert.deepEqual(validatePublicSlug('Äpfel & Crème'), {
    isValid: true,
    slug: 'aepfel-creme',
  })
  assert.deepEqual(validatePublicSlug('', { label: 'Handle' }), {
    isValid: false,
    slug: '',
    message: 'Handle cannot be empty.',
    reason: 'format',
  })
  assert.deepEqual(
    validatePublicSlug('NEW', { label: 'Menu', namespace: 'food' }),
    {
      isValid: false,
      slug: 'new',
      message: 'Menu "new" is reserved in food.',
      reason: 'reserved',
      reservedKey: 'new',
    }
  )
})

test('build registration reaches runtime through an explicit App snapshot only', () => {
  const key = 'slug-test-added-route'
  const later = 'slug-test-later-app-route'
  registerReservedRootRouteKeys([` ${key.toUpperCase()} `, key, ''])
  assert.equal(
    getReservedRootRouteKeys().filter((value) => value === key).length,
    1
  )
  const nuxt = { options: { runtimeConfig: {} } }
  configureFireuxModule({}, nuxt, {})
  const keys = nuxt.options.runtimeConfig.public.fireux.reservedRouteKeys
  assert.ok(keys.includes(key))
  registerReservedRootRouteKeys([later])
  assert.equal(validatePublicSlug(key, { reservedScope: 'root' }).isValid, true)
  assert.equal(
    validatePublicSlug(key, {
      reservedScope: 'root',
      runtimeReservedRouteKeys: keys,
    }).reason,
    'reserved'
  )
  assert.equal(
    validatePublicSlug(later, {
      reservedScope: 'root',
      runtimeReservedRouteKeys: keys,
    }).isValid,
    true
  )
  assert.equal(
    validatePublicSlug('route', {
      reservedScope: 'none',
      runtimeReservedRouteKeys: [' ROUTE '],
    }).reason,
    'reserved'
  )
  assert.equal(
    validatePublicSlug('custom', { reserved: [' CUSTOM '] }).reason,
    'reserved'
  )
})

test('User validation consumes runtime keys and retains format bounds', () => {
  const source = readFileSync(
    new URL('../../../runtime/user/utils/user-handle.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const validate = compileFunction(
    `${stripTypeScriptTypes(source)}; return validateUserHandleForPublicRoute`,
    ['useRuntimeConfig', 'normalizeSlug', 'validatePublicSlug']
  )(
    () => ({ public: { fireux: { reservedRouteKeys: [' Reserved-App '] } } }),
    normalizeSlug,
    validatePublicSlug
  )
  assert.equal(validate('Reserved App').isValid, false)
  assert.equal(validate('ab').isValid, false)
  assert.deepEqual(validate('Some Person'), {
    isValid: true,
    handle: 'some-person',
  })
})

test('availability checks follow validation and retain unavailable/optional behavior', async () => {
  let calls = 0
  const check = async () => {
    calls++
    return { available: false, message: 'Taken already' }
  }
  await assert.rejects(
    assertPublicSlug('new', { isAvailable: check }),
    /reserved/
  )
  assert.equal(calls, 0)
  await assert.rejects(
    assertPublicSlug('Allowed', { isAvailable: check }),
    /Taken already/
  )
  assert.equal(calls, 1)
  assert.equal(
    await assertPublicSlug('', { required: false, isAvailable: check }),
    ''
  )
  assert.equal(calls, 1)
  assert.equal(
    await assertPublicSlug('Allowed', { isAvailable: async () => true }),
    'allowed'
  )
})
