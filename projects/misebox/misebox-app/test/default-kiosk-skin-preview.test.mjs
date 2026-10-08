import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(
  new URL('../app/composables/useDefaultKioskSkinPreview.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
function load(requestFetch) {
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return useDefaultKioskSkinPreview`,
    ['useRequestFetch']
  )(() => requestFetch)
}
function payload() {
  return {
    kind: 'manifest',
    manifest: {
      source: { kitchenId: 'pizza', kitchenSlug: 'pizza', menuId: 'food' },
      content: { name: 'Food', sections: [] },
      behaviour: { ordering: { enabled: false, order_types: [] }, choices: [] },
      presentation: { kitchenName: 'Pizza', currencyCode: 'CHF' },
    },
  }
}

test('The skin preview supplies both modes with the Offering identity accepted by ShowcaseKiosk', async () => {
  const calls = []
  const original = payload()
  const preview = load(async (url) => {
    calls.push(url)
    return url.startsWith('/api/menus/')
      ? original
      : {
          place: {
            tagline: ' Pizza ',
            cover_image: 'cover',
            logo_image: 'logo',
            wordmark_image: 'wordmark',
          },
        }
  })
  const { manifest, kitchen } = await preview()
  const configs = manifest.behaviour.ordering.order_types.filter(
    (config) =>
      config.kitchen_offering_id === 'service-counter' &&
      ['eat_in', 'takeaway'].includes(config.type)
  )
  assert.deepEqual(
    configs.map((config) => config.type),
    ['eat_in', 'takeaway']
  )
  assert.ok(
    configs.every(
      (config) => config.kitchen_offering_name === 'Counter preview'
    )
  )
  assert.equal(manifest.behaviour.defaultOrderTypeConfig, configs[0])
  assert.equal(manifest.presentation.kitchenImageUrl, 'cover')
  assert.equal(manifest.presentation.kitchenLogoImageUrl, 'logo')
  assert.equal(manifest.presentation.kitchenWordmarkImageUrl, 'wordmark')
  assert.deepEqual(kitchen, { id: 'pizza', label: 'Pizza', tagline: 'Pizza' })
  assert.equal(original.manifest.behaviour.ordering.enabled, false)
  assert.deepEqual(original.manifest.behaviour.ordering.order_types, [])
  assert.deepEqual(calls, [
    '/api/menus/food?kitchenSlug=interlaken-pizza',
    '/api/places/ChIJWcym7tulj0cRb3N2twqVj1U',
  ])
})

test('A non-renderable Menu fails explicitly rather than manufacturing an empty kiosk', async () => {
  const preview = load(async (url) =>
    url.startsWith('/api/menus/') ? { kind: 'missing' } : { place: {} }
  )
  await assert.rejects(preview(), /does not expose a renderable Menu manifest/)
})

test('A failed public source remains a failure', async () => {
  const preview = load(async () => {
    throw new Error('Public source unavailable')
  })
  await assert.rejects(preview(), /Public source unavailable/)
})
