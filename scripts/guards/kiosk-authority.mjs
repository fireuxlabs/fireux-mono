// @fireux-script
// last_used: 2026-08-30
// usage_note: run through pnpm guard; protects Kitchen Kiosk device authority.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const read = (repoRoot, file) => readFileSync(path.join(repoRoot, file), 'utf8')

export function run({ repoRoot }) {
  const rules = read(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-operations.rules'
  )
  assert.match(
    rules,
    /match \/kiosks\/\{kioskId\} \{[\s\S]*allow get, list, create, update, delete: if false;/,
    'Kitchen Kiosk credentials must remain completely server-only.'
  )
  assert.match(
    rules,
    /'integrations',[\s\S]*'kiosks',[\s\S]*'dishes'/,
    'The generic Kitchen-child allowance must explicitly exclude Kiosks.'
  )

  const target = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/kiosks/mutation-targets.ts'
  )
  assert.match(target, /lane: 'server'/)
  assert.match(target, /key: 'kitchens\.kiosks'/)
  assert.match(target, /KitchenKioskDeviceStorage\.collection/)

  const token = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/kiosks/session-token.ts'
  )
  for (const contract of [
    /randomBytes\(32\)/,
    /createHash\('sha256'\)/,
    /timingSafeEqual/,
  ]) {
    assert.match(token, contract)
  }

  const session = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/kiosks/session.ts'
  )
  for (const contract of [
    /httpOnly: true/,
    /sameSite: 'strict'/,
    /process\.env\.NODE_ENV === 'production'/,
    /record\.status === 'active'/,
    /timestampMillis\(record\.expires_at\) > now/,
    /text\(record\.app_id\) !== expected\.appId/,
    /text\(record\.kitchen_id\) !== expected\.kitchenId/,
    /text\(record\.menu_id\) !== expected\.menuId/,
  ]) {
    assert.match(session, contract)
  }

  const devices = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/kiosks/devices.ts'
  )
  for (const contract of [
    /requireKitchenMutationAuthority/,
    /serverKitchenKiosksTarget/,
    /text\(menu\.data\?\.status\) !== 'published'/,
    /session_hash: session\.hash/,
    /session_hash: ''/,
    /setKitchenKioskSessionCookie/,
  ]) {
    assert.match(devices, contract)
  }

  const menuRead = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId].get.ts'
  )
  assert.match(
    menuRead,
    /menuContext === 'kiosk'[\s\S]*requireKitchenKioskSession/
  )
  const orderCreate = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders.post.ts'
  )
  assert.match(
    orderCreate,
    /selection\.channel === 'kiosk'[\s\S]*requireKitchenKioskSession/
  )

  const page = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/orders/kiosks.vue'
  )
  assert.match(page, /requiresAuth: true/)
  assert.match(page, /requiresSelection: true/)
}
