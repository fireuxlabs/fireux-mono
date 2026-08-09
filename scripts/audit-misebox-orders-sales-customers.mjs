#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of KitchenOrder, KitchenSale, CustomerProfile, and User-owned CustomerOrderLink integrity in Misebox.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `orders-sales-customers-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const issues = []
const issue = (kind, context = {}) => issues.push({ kind, ...context })
const counts = {
  apps: 0,
  customer_profiles: 0,
  kitchen_orders: 0,
  kitchen_sales: 0,
  canonical_customer_order_links: 0,
  legacy_customer_order_links: 0,
  historical_order_app_provenance: 0,
  pre_sale_completed_orders: 0,
}

const appSnapshot = await db.collection('apps').get()
counts.apps = appSnapshot.size
const customerProfiles = new Set()
for (const appDoc of appSnapshot.docs) {
  const customers = await appDoc.ref.collection('customers').get()
  counts.customer_profiles += customers.size
  customers.docs.forEach(doc => customerProfiles.add(`${appDoc.id}/${doc.id}`))
}

const orderGroup = await db.collectionGroup('orders').get()
const orders = new Map()
const canonicalLinks = []
const legacyLinks = []
for (const doc of orderGroup.docs) {
  const segments = doc.ref.path.split('/')
  const data = doc.data() || {}
  if (
    segments.length === 6 && segments[0] === 'apps' &&
    segments[2] === 'kitchens' && segments[4] === 'orders'
  ) {
    const [appId, kitchenId] = [segments[1], segments[3]]
    const key = `${appId}/${kitchenId}/${doc.id}`
    counts.kitchen_orders += 1
    orders.set(key, { appId, kitchenId, id: doc.id, data, path: doc.ref.path })
    if (text(data.id) !== doc.id) issue('order_id_mismatch', { order_path: doc.ref.path, stored_id: text(data.id) })
    if (text(data.kitchen_id) !== kitchenId) issue('order_kitchen_mismatch', { order_path: doc.ref.path, stored_kitchen_id: text(data.kitchen_id) })
    if (text(data.created?.app_id) !== appId) counts.historical_order_app_provenance += 1
    continue
  }
  if (
    segments.length === 6 && segments[0] === 'apps' &&
    segments[2] === 'customers' && segments[4] === 'orders'
  ) {
    counts.canonical_customer_order_links += 1
    canonicalLinks.push({ appId: segments[1], uid: segments[3], id: doc.id, data, path: doc.ref.path })
    continue
  }
  if (segments.length === 4 && segments[0] === 'customers' && segments[2] === 'orders') {
    counts.legacy_customer_order_links += 1
    legacyLinks.push({ uid: segments[1], id: doc.id, data, path: doc.ref.path })
  }
}

const saleGroup = await db.collectionGroup('sales').get()
const sales = new Map()
for (const doc of saleGroup.docs) {
  const segments = doc.ref.path.split('/')
  if (
    segments.length !== 6 || segments[0] !== 'apps' ||
    segments[2] !== 'kitchens' || segments[4] !== 'sales'
  ) continue
  counts.kitchen_sales += 1
  const [appId, kitchenId] = [segments[1], segments[3]]
  const data = doc.data() || {}
  const key = `${appId}/${kitchenId}/${doc.id}`
  sales.set(key, data)
  const expectedOrderPath = `apps/${appId}/kitchens/${kitchenId}/orders/${doc.id}`
  const order = orders.get(key)
  if (!order) issue('sale_order_missing', { sale_path: doc.ref.path, order_path: expectedOrderPath })
  else if (text(order.data.status) !== 'completed') issue('sale_order_not_completed', { sale_path: doc.ref.path, order_status: text(order.data.status) })
  if (text(data.id) !== doc.id || text(data.order_id) !== doc.id) issue('sale_order_id_mismatch', { sale_path: doc.ref.path, stored_id: text(data.id), stored_order_id: text(data.order_id) })
  if (text(data.app_id) !== appId || text(data.kitchen_id) !== kitchenId) issue('sale_scope_mismatch', { sale_path: doc.ref.path, stored_app_id: text(data.app_id), stored_kitchen_id: text(data.kitchen_id) })
  if (text(data.order_path) !== expectedOrderPath) issue('sale_order_path_mismatch', { sale_path: doc.ref.path, stored_order_path: text(data.order_path) })
  const factId = text(data.financial_fact_id)
  if (!factId || !(await db.doc(`apps/${appId}/financial-facts/${factId}`).get()).exists) {
    issue('sale_financial_fact_missing', { sale_path: doc.ref.path, financial_fact_id: factId })
  }
}

for (const order of orders.values()) {
  if (text(order.data.status) === 'completed' && !sales.has(`${order.appId}/${order.kitchenId}/${order.id}`)) {
    const createdAt = order.data.created?.at?.toDate?.().getTime?.() || 0
    const saleContractReleasedAt = Date.parse('2026-07-21T00:00:00.000Z')
    if (createdAt && createdAt < saleContractReleasedAt) {
      counts.pre_sale_completed_orders += 1
    } else {
      issue('completed_order_sale_missing', { order_path: order.path })
    }
  }
}

function auditLink(link, expectedAppId) {
  const appId = text(link.data.app_id) || expectedAppId
  const match = text(link.data.order_path).match(/^apps\/([^/]+)\/kitchens\/([^/]+)\/orders\/([^/]+)$/)
  if (!match || match[1] !== appId || match[3] !== link.id) {
    issue('customer_order_link_path_invalid', { link_path: link.path, order_path: text(link.data.order_path), app_id: appId })
    return
  }
  const order = orders.get(`${match[1]}/${match[2]}/${match[3]}`)
  if (!order) issue('customer_order_link_order_missing', { link_path: link.path, order_path: text(link.data.order_path) })
  else if (text(order.data.customer_uid) !== link.uid) issue('customer_order_link_user_mismatch', { link_path: link.path, order_customer_uid: text(order.data.customer_uid) })
}

canonicalLinks.forEach(link => auditLink(link, link.appId))
legacyLinks.forEach((link) => {
  auditLink(link, text(link.data.app_id))
  issue('legacy_customer_order_link_path', {
    link_path: link.path,
    canonical_path: `apps/${text(link.data.app_id)}/customers/${link.uid}/orders/${link.id}`,
  })
})

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: { ...counts, issues: issues.length },
  customer_profiles_without_requirement: customerProfiles.size,
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
