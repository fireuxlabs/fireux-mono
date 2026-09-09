// @fireux-script
// last_used: 2026-09-03
// usage_note: run through pnpm guard; locks supported Menu ordering surfaces to one KitchenOrder spine.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ORDER_CONTEXTS = ['delivery', 'collection', 'pre_order', 'kiosk']

export async function run({ repoRoot = process.cwd() } = {}) {
  const runtimeRoot = path.join(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime'
  )
  const readRuntime = (relativePath) =>
    readFileSync(path.join(runtimeRoot, relativePath), 'utf8')

  const route = readRuntime('menu/components/Route.vue')
  const order = readRuntime('menu/components/Order/Index.vue')
  const lifecycle = readRuntime(
    'menu/composables/order/useMenuOrderLifecycle.ts'
  )
  const createEndpoint = readRuntime(
    'server/api/menus/[menuId]/orders.post.ts'
  )

  assert.match(
    route,
    /menuRouteProjection\(menuTarget\.value\.context\)/,
    'MenuRoute must classify the route context through the canonical projection seam.'
  )
  assert.match(
    route,
    /<MenuOrder\b/,
    'Supported ordering routes must enter the package-owned MenuOrder surface.'
  )

  for (const context of ORDER_CONTEXTS) {
    assert.match(
      order,
      new RegExp(`menuContext === ['"]${context}['"]|menuContext:\\s*['"]${context}['"]`),
      `MenuOrder must retain an explicit ${context} surface.`
    )
  }

  const surfaceComposables = {
    collection: 'useMenuOrderPickup.ts',
    delivery: 'useMenuOrderDelivery.ts',
    pre_order: 'useMenuOrderPreOrder.ts',
    kiosk: 'useMenuOrderKiosk.ts',
  }
  for (const [context, filename] of Object.entries(surfaceComposables)) {
    const source = readRuntime(`menu/composables/order/${filename}`)
    assert.match(
      source,
      /useMenuOrderLifecycle\(/,
      `${context} must submit through the shared MenuOrder lifecycle.`
    )
    assert.match(
      source,
      /lifecycle\.submit\(/,
      `${context} must not bypass canonical Menu order submission.`
    )
  }

  assert.match(
    lifecycle,
    /`\/api\/menus\/\$\{encodeURIComponent\(menuId\)\}\/orders`/,
    'The shared lifecycle must submit to the canonical Menu order endpoint.'
  )
  assert.match(
    lifecycle,
    /idempotency_key:\s*requestKey/,
    'Every browser ordering surface must submit an idempotency key.'
  )

  for (const requiredServerStep of [
    'readMenuOrderContext(',
    'resolveMenuOrderItems(',
    'resolveMenuOrderFulfilment(',
    'assembleMenuOrderRecord(',
    'commitMenuOrderIdempotently(',
    'commitKitchenOrderWithServiceSequence(',
  ]) {
    assert.ok(
      createEndpoint.includes(requiredServerStep),
      `Canonical Menu order creation must retain ${requiredServerStep}`
    )
  }
  assert.match(
    createEndpoint,
    /selection\.channel === ['"]kiosk['"]\s*\?\s*await requireKitchenKioskSession/,
    'Kiosk orders must retain their scoped device authority before joining the shared order spine.'
  )

  console.log('[guard] ✅ menu order spine valid')
}
