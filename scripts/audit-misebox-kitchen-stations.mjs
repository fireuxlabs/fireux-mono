#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of AppKitchen-owned Station records and their Kitchen Team/Mise references in Misebox.

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
  `kitchen-stations-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const isTimestamp = value => Boolean(value && typeof value.toDate === 'function')
const issues = []
const issue = (kind, context = {}) => issues.push({ kind, ...context })
const counts = {
  apps: 0,
  root_kitchens: 0,
  app_kitchens: 0,
  stations: 0,
  team_members: 0,
  mise_tasks: 0,
}

const [appSnapshot, kitchenSnapshot, stationSnapshot] = await Promise.all([
  db.collection('apps').get(),
  db.collection('kitchens').get(),
  db.collectionGroup('stations').get(),
])
counts.apps = appSnapshot.size
counts.root_kitchens = kitchenSnapshot.size
counts.stations = stationSnapshot.size

const apps = new Set(appSnapshot.docs.map(doc => doc.id))
const kitchens = new Set(kitchenSnapshot.docs.map(doc => doc.id))
const supportPaths = new Set()
const stationIdsBySupport = new Map()
const stationOrdersBySupport = new Map()
const allowedStationKeys = new Set([
  'kitchen_id',
  'name',
  'description',
  'active',
  'sort_order',
  'created',
  'updated',
])

for (const appDoc of appSnapshot.docs) {
  const supports = await appDoc.ref.collection('kitchens').get()
  counts.app_kitchens += supports.size
  for (const support of supports.docs) {
    const supportKey = `${appDoc.id}/${support.id}`
    supportPaths.add(supportKey)
    if (!kitchens.has(support.id)) {
      issue('station_parent_root_missing', {
        app_id: appDoc.id,
        kitchen_id: support.id,
      })
    }
  }
}

for (const stationDoc of stationSnapshot.docs) {
  const segments = stationDoc.ref.path.split('/')
  const context = { path: stationDoc.ref.path, station_id: stationDoc.id }
  if (
    segments.length !== 6 ||
    segments[0] !== 'apps' ||
    segments[2] !== 'kitchens' ||
    segments[4] !== 'stations'
  ) {
    issue('station_path_invalid', context)
    continue
  }

  const appId = segments[1]
  const kitchenId = segments[3]
  const supportKey = `${appId}/${kitchenId}`
  const scoped = { ...context, app_id: appId, kitchen_id: kitchenId }
  const data = stationDoc.data() || {}
  if (!apps.has(appId)) issue('station_app_missing', scoped)
  if (!supportPaths.has(supportKey)) issue('station_app_kitchen_missing', scoped)
  if (!kitchens.has(kitchenId)) issue('station_kitchen_root_missing', scoped)
  if (Object.hasOwn(data, 'id') && text(data.id) !== stationDoc.id) {
    issue('station_id_mismatch', { ...scoped, stored_id: text(data.id) })
  }
  if (text(data.kitchen_id) !== kitchenId) {
    issue('station_scope_mismatch', {
      ...scoped,
      stored_kitchen_id: text(data.kitchen_id),
    })
  }
  if (!text(data.name) || text(data.name).length > 120) {
    issue('station_name_invalid', scoped)
  }
  if (typeof data.description !== 'string' || data.description.length > 2000) {
    issue('station_description_invalid', scoped)
  }
  if (typeof data.active !== 'boolean') issue('station_active_invalid', scoped)
  if (
    !Number.isInteger(data.sort_order) ||
    data.sort_order < 0 ||
    data.sort_order > 10000
  ) {
    issue('station_sort_order_invalid', {
      ...scoped,
      sort_order: data.sort_order ?? null,
    })
  }
  const unknownKeys = Object.keys(data).filter(key => !allowedStationKeys.has(key))
  if (unknownKeys.length) {
    issue('station_schema_pollution', { ...scoped, keys: unknownKeys.sort() })
  }
  if (
    !isTimestamp(data.created?.at) ||
    !text(data.created?.by) ||
    text(data.created?.app_id) !== appId
  ) {
    issue('station_created_stamp_invalid', scoped)
  }
  if (!isTimestamp(data.updated?.at) || !text(data.updated?.by)) {
    issue('station_updated_stamp_invalid', scoped)
  }

  const ids = stationIdsBySupport.get(supportKey) || new Set()
  ids.add(stationDoc.id)
  stationIdsBySupport.set(supportKey, ids)
  if (Number.isInteger(data.sort_order)) {
    const orders = stationOrdersBySupport.get(supportKey) || new Map()
    const existing = orders.get(data.sort_order)
    if (existing) {
      issue('station_sort_order_duplicate', {
        ...scoped,
        sort_order: data.sort_order,
        other_station_id: existing,
      })
    } else {
      orders.set(data.sort_order, stationDoc.id)
      stationOrdersBySupport.set(supportKey, orders)
    }
  }
}

for (const supportKey of supportPaths) {
  const [appId, kitchenId] = supportKey.split('/')
  const support = db.collection('apps').doc(appId).collection('kitchens').doc(kitchenId)
  const [team, mise] = await Promise.all([
    support.collection('team').get(),
    support.collection('mise').get(),
  ])
  counts.team_members += team.size
  counts.mise_tasks += mise.size
  const stationIds = stationIdsBySupport.get(supportKey) || new Set()

  for (const member of team.docs) {
    const ids = member.data()?.station_ids
    if (ids !== undefined && !Array.isArray(ids)) {
      issue('team_station_ids_invalid', {
        app_id: appId,
        kitchen_id: kitchenId,
        member_id: member.id,
      })
      continue
    }
    for (const stationId of ids || []) {
      if (!text(stationId) || !stationIds.has(text(stationId))) {
        issue('team_station_not_found', {
          app_id: appId,
          kitchen_id: kitchenId,
          member_id: member.id,
          station_id: text(stationId),
        })
      }
    }
  }

  for (const task of mise.docs) {
    const stationId = text(task.data()?.station)
    if (stationId && !stationIds.has(stationId)) {
      issue('mise_station_not_found', {
        app_id: appId,
        kitchen_id: kitchenId,
        task_id: task.id,
        station_id: stationId,
      })
    }
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: { ...counts, issues: issues.length },
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
