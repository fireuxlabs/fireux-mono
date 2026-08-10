#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of canonical Kitchen roots, linked Places, same-id AppKitchen access, and User Console targets in Misebox.

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
  `kitchen-authority-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null
const exactKeys = (value, keys) => {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
}
const ids = (value, limit) => {
  if (!Array.isArray(value) || value.length > limit) return null
  const normalized = value.map(text)
  if (normalized.some(id => !id) || new Set(normalized).size !== normalized.length) return null
  return normalized
}
const issue = (kind, context) => issues.push({ kind, ...context })
const issues = []

const [appSnapshot, kitchenSnapshot, placeSnapshot, userSnapshot] = await Promise.all([
  db.collection('apps').get(),
  db.collection('kitchens').get(),
  db.collection('places').get(),
  db.collection('users').get(),
])
const apps = new Set(appSnapshot.docs.map(doc => doc.id))
const kitchens = new Map(kitchenSnapshot.docs.map(doc => [doc.id, doc.data() || {}]))
const places = new Map(placeSnapshot.docs.map(doc => [doc.id, doc.data() || {}]))
const appSupports = new Map()
const memberships = new Set()
const kitchensBySlug = new Map()

for (const appDoc of appSnapshot.docs) {
  const [supportSnapshot, membershipSnapshot] = await Promise.all([
    appDoc.ref.collection('kitchens').get(),
    appDoc.ref.collection('users').get(),
  ])
  for (const doc of membershipSnapshot.docs) memberships.add(`${appDoc.id}/${doc.id}`)
  for (const doc of supportSnapshot.docs) {
    const key = `${appDoc.id}/${doc.id}`
    const data = doc.data() || {}
    appSupports.set(key, data)
    const operatorIds = ids(data.operator_ids, 50)
    const teamIds = ids(data.team_ids, 100)
    const joinRequests = ids(data.join_requests, 100)
    const teamSnapshot = await doc.ref.collection('team').get()
    const operationalUsers = new Set(
      teamSnapshot.docs.map(member => text(member.data().user_id)).filter(Boolean)
    )
    if (
      !exactKeys(data, ['operator_ids', 'team_ids', 'join_requests', 'created', 'updated']) ||
      !operatorIds || !teamIds || !joinRequests
    ) {
      issue('malformed_app_kitchen_support', {
        app_id: appDoc.id,
        kitchen_id: doc.id,
        keys: Object.keys(data).sort(),
      })
    }
    if (!kitchens.has(doc.id)) {
      issue('orphan_app_kitchen_support', { app_id: appDoc.id, kitchen_id: doc.id })
    }
    for (const uid of new Set([...(operatorIds || []), ...(teamIds || [])])) {
      if (!memberships.has(`${appDoc.id}/${uid}`)) {
        issue('app_kitchen_member_without_app_membership', {
          app_id: appDoc.id,
          kitchen_id: doc.id,
          user_id: uid,
          operator: (operatorIds || []).includes(uid),
          team: (teamIds || []).includes(uid),
          operational_team_record: operationalUsers.has(uid),
        })
      }
    }
  }
}

const kitchensByPlace = new Map()
for (const [kitchenId, kitchen] of kitchens) {
  const context = { kitchen_id: kitchenId }
  const placeId = text(kitchen.place_id)
  const scope = record(kitchen.app_scope)
  const state = text(scope?.state)
  const appId = text(scope?.app_id)
  const visibility = record(kitchen.visibility) || {}
  const published = visibility.show === true && visibility.active !== false
  const slug = text(kitchen.slug)

  if (
    !scope ||
    !exactKeys(scope, ['state', 'app_id']) ||
    !['parent_app', 'tenant_app'].includes(state) ||
    !appId ||
    Object.hasOwn(kitchen, 'app_scope_state') ||
    Object.hasOwn(kitchen, 'app_scope_app_id') ||
    Object.hasOwn(kitchen, 'app_id')
  ) {
    issue('invalid_kitchen_app_scope', {
      ...context,
      app_scope: scope,
      legacy_keys: ['app_scope_state', 'app_scope_app_id', 'app_id']
        .filter(key => Object.hasOwn(kitchen, key)),
    })
  }
  if (appId && !apps.has(appId)) issue('missing_kitchen_app', { ...context, app_id: appId })
  if (!placeId || !places.has(placeId)) {
    issue('missing_kitchen_place', { ...context, place_id: placeId })
  } else {
    if (kitchenId !== placeId) {
      issue('kitchen_place_id_mismatch', { ...context, place_id: placeId })
    }
    const placeIds = kitchensByPlace.get(placeId) || []
    placeIds.push(kitchenId)
    kitchensByPlace.set(placeId, placeIds)
  }
  if (appId && !appSupports.has(`${appId}/${kitchenId}`)) {
    issue('missing_same_id_app_kitchen_support', { ...context, app_id: appId })
  }
  for (const supportKey of appSupports.keys()) {
    const [supportAppId, supportKitchenId] = supportKey.split('/')
    if (supportKitchenId === kitchenId && appId && supportAppId !== appId) {
      issue('app_kitchen_support_scope_mismatch', {
        ...context,
        app_id: appId,
        support_app_id: supportAppId,
      })
    }
  }
  if (slug) {
    const kitchenIds = kitchensBySlug.get(slug) || []
    kitchenIds.push(kitchenId)
    kitchensBySlug.set(slug, kitchenIds)
  }
  if (published && !slug) issue('published_kitchen_slug_missing', context)
  if (
    Object.hasOwn(kitchen, 'operator_ids') ||
    Object.hasOwn(kitchen, 'team_ids') ||
    Object.hasOwn(kitchen, 'join_requests')
  ) {
    issue('kitchen_root_contains_access_authority', { ...context })
  }
}

for (const [placeId, kitchenIds] of kitchensByPlace) {
  if (kitchenIds.length > 1) {
    issue('multiple_kitchens_for_place', { place_id: placeId, kitchen_ids: kitchenIds.sort() })
  }
}

for (const [slug, kitchenIds] of kitchensBySlug) {
  if (kitchenIds.length > 1) {
    issue('duplicate_kitchen_route_slug', { slug, kitchen_ids: kitchenIds.sort() })
  }
}

let userTargetDocuments = 0
let kitchenTargetIds = 0
for (const userDoc of userSnapshot.docs) {
  const target = await userDoc.ref.collection('private').doc('targets').get()
  if (!target.exists) continue
  userTargetDocuments += 1
  const rawKitchenIds = target.data()?.kitchen_ids
  if (rawKitchenIds === undefined) continue
  const targetIds = ids(rawKitchenIds, 50)
  if (!targetIds) {
    issue('malformed_user_kitchen_targets', { user_id: userDoc.id })
    continue
  }
  kitchenTargetIds += targetIds.length
  for (const kitchenId of targetIds) {
    const kitchen = kitchens.get(kitchenId)
    const appId = text(record(kitchen?.app_scope)?.app_id)
    const support = appSupports.get(`${appId}/${kitchenId}`)
    const authorized = new Set([
      ...(ids(support?.operator_ids, 50) || []),
      ...(ids(support?.team_ids, 100) || []),
    ])
    if (!kitchen || !appId || !support || !authorized.has(userDoc.id)) {
      issue('stale_or_unauthorized_user_kitchen_target', {
        user_id: userDoc.id,
        kitchen_id: kitchenId,
        app_id: appId,
      })
    }
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: {
    apps: appSnapshot.size,
    places: placeSnapshot.size,
    kitchens: kitchenSnapshot.size,
    app_kitchen_supports: appSupports.size,
    users: userSnapshot.size,
    user_target_documents: userTargetDocuments,
    kitchen_target_ids: kitchenTargetIds,
    issues: issues.length,
  },
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
