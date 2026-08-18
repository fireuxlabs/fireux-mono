// @fireux-script
// last_used: 2026-08-09
// usage_note: run through pnpm guard; locks KitchenOrder lifecycle, KitchenSale derivation, and App-scoped Customer link authority.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const orderModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/order.model.ts'
  )
  const saleModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/sale.model.ts'
  )
  const customerModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/user/models/customer.model.ts'
  )
  const linkModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/user/models/customer/order.model.ts'
  )
  const transition = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/orders/transition.post.ts'
  )
  const serverTargets = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/utils/firestore-mutations/server-targets.ts'
  )
  const customerOrders = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/user/server/customer/orders/read.ts'
  )

  assert.match(
    orderModel,
    /export const KitchenOrderEntity\s*=\s*defineFireuxEntity/
  )
  assert.match(orderModel, /export const KitchenOrderDefaults\b/)
  assert.match(orderModel, /parent:\s*'Kitchen'/)
  assert.match(
    saleModel,
    /export const KitchenSaleRecord\s*=\s*defineFireuxEntity/
  )
  assert.match(saleModel, /parent:\s*'KitchenOrder'/)
  assert.match(
    customerModel,
    /export const CustomerProfileRecord\s*=\s*defineFireuxEntity/
  )
  assert.match(customerModel, /export const CustomerDefaults\b/)
  assert.match(
    linkModel,
    /export const CustomerOrderLinkRecord\s*=\s*defineFireuxEntity/
  )
  assert.match(
    linkModel,
    /apps\/\{appId\}\/customers\/\{userId\}\/orders\/\{orderId\}/
  )
  assert.match(transition, /runGuardedServerTransaction/)
  assert.match(transition, /buildCompletedKitchenOrderSale/)
  assert.match(transition, /mutations\.create\(sales/)
  assert.match(transition, /mutations\.create\([\s\S]*financialFacts/)
  assert.match(
    serverTargets,
    /serverCustomerOrdersTarget = \(appId: string, customerId: string\)/
  )
  assert.match(
    serverTargets,
    /apps\/\$\{app\}\/customers\/\$\{customer\}\/orders/
  )
  assert.match(
    customerOrders,
    /apps\/\$\{appId\}\/customers\/\$\{uid\}\/orders/
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-kitchens/src/runtime/user/composables/firestore/profiles/Customer/useCustomer.ts'
      )
    ),
    false,
    'The current Customer read context belongs above the Firestore profile adapter.'
  )
}
