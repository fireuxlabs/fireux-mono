#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: backup and normalize Misebox User, app membership, and domain-only profile documents before hardened rules deploy.
// Concurrent edit — 2026-07-20 12:50 CEST — Security spine: protect migration writes with read-version preconditions and keep App governance private.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: strip embedded User snapshots and verify uid joins.
// Concurrent edit — 2026-07-20 13:42 CEST — Security rollout gate: record the verified profile-boundary migration before Rules promotion.

import process from 'node:process'
import { writeFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'misebox-app'
const MIGRATION_MARKER_PATH = 'security-migrations/user-profile-boundary-v3'
const commit = process.argv.includes('--commit')

const USER_KEYS = new Set([
  'display_name',
  'avatar',
  'handle',
  'app_ids',
  'profiles',
  'created',
  'updated',
])
const APP_KEYS = new Set([
  'project_id',
  'ecosystem_id',
  'database_id',
  'slug',
  'status',
  'app_name',
  'app_short_name',
  'role',
  'tagline',
  'description',
  'short_bio',
  'long_bio',
  'social_links',
  'derived',
  'media',
  'fireux_native',
  'fireux_size',
  'fireux_repo',
  'self_join_enabled',
  'moderation_state',
  'ban_reasons',
  'created',
  'updated',
])
const APP_USER_KEYS = new Set([
  'role',
  'is_premium',
  'console_enabled',
  'profiles',
  'console_targets',
  'created',
  'updated',
])
const DRIVER_KEYS = new Set([
  'title',
  'subtitle',
  'tagline',
  'tags',
  'coverage',
  'created',
  'updated',
])
const APP_DRIVER_KEYS = new Set([
  'driver_phone',
  'accepts_weak_pings',
  'accepts_delivery_tenders',
  'active_kitchen_ids',
  'kitchen_links',
  'created',
  'updated',
])
const CUSTOMER_KEYS = new Set(['private', 'created', 'updated'])
const PROFILE_OVERLAY_KEYS = new Set(['created', 'updated'])
const ROOT_PROFILE_KEYS = {
  agents: new Set([
    'title',
    'summary',
    'agent_bio',
    'agent_image',
    'agent_placement_types',
    'agent_coverage_areas',
    'agent_contact_email',
    'agent_contact_phone',
    'agent_website_url',
    'subtitle',
    'tagline',
    'tags',
    'contact_email',
    'contact_phone',
    'website_url',
    'created',
    'updated',
  ]),
  chefs: new Set([
    'title',
    'summary',
    'chef_bio',
    'chef_image',
    'chef_signature_dishes',
    'kitchen_ids',
    'chef_organization_name',
    'subtitle',
    'tagline',
    'tags',
    'bio_long',
    'specialties',
    'locations',
    'organization_name',
    'created',
    'updated',
  ]),
  professionals: new Set([
    'title',
    'subtitle',
    'tagline',
    'summary',
    'bio',
    'image',
    'positions',
    'tags',
    'relevant_experience',
    'other_experience',
    'languages',
    'certifications',
    'education',
    'volunteering',
    'projects',
    'created',
    'updated',
  ]),
}
const CUSTOMER_PRIVATE_KEYS = new Set([
  'name',
  'phone',
  'allergy_note',
  'default_delivery_address',
  'saved_addresses',
  'order_history',
])
const REQUIRED_CONSOLE_TARGETS = [
  'kitchen_ids',
  'supplier_ids',
  'property_ids',
  'portfolio_ids',
  'blank_ids',
]

if (process.argv.includes('--help')) {
  console.log(`
Harden Misebox User/Profile documents before Security Rules deployment.

Target: ${PROJECT_ID}/${DATABASE_ID}, App ${APP_ID}

Usage:
  node scripts/harden-misebox-user-security.mjs
  node scripts/harden-misebox-user-security.mjs --commit

Dry-run is the default. --commit writes a mode-0600 JSON backup under
/private/tmp before applying changes, then verifies the hardened boundary.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const unknownArgs = process.argv
  .slice(2)
  .filter((argument) => argument !== '--commit')
if (unknownArgs.length) {
  throw new Error(`Unknown argument(s): ${unknownArgs.join(', ')}`)
}

const credential = await resolveFirebaseAdminCredential({
  args: {},
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const adminApp = initializeApp(
  { credential: credential.credential, projectId: PROJECT_ID },
  'misebox-user-security-hardening'
)
const db = getFirestore(adminApp, DATABASE_ID)

try {
  const state = await readState()
  const plan = buildPlan(state)

  if (!commit) {
    console.log(JSON.stringify({ mode: 'dry-run', ...plan.summary }, null, 2))
  } else {
    const backupPath = await writeBackup(plan)
    await applyPlan(plan)
    const verification = await verify()
    console.log(
      JSON.stringify(
        {
          mode: 'commit',
          backupPath,
          ...plan.summary,
          verification,
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(adminApp)
}

async function collectionRows(path) {
  const snapshot = await db.collection(path).get()
  return new Map(
    snapshot.docs.map((document) => [
      document.id,
      {
        path: document.ref.path,
        ref: document.ref,
        data: document.data(),
        updateTime: document.updateTime,
      },
    ])
  )
}

async function readState() {
  const [
    users,
    appUsers,
    rootDrivers,
    appDrivers,
    appCustomers,
    rootCustomers,
    joinRequests,
    rootAgents,
    rootChefs,
    rootProfessionals,
    appAgents,
    appChefs,
    appProfessionals,
    appSnapshot,
  ] = await Promise.all([
    collectionRows('users'),
    collectionRows(`apps/${APP_ID}/users`),
    collectionRows('drivers'),
    collectionRows(`apps/${APP_ID}/drivers`),
    collectionRows(`apps/${APP_ID}/customers`),
    collectionRows('customers'),
    collectionRows(`apps/${APP_ID}/join-requests`),
    collectionRows('agents'),
    collectionRows('chefs'),
    collectionRows('professionals'),
    collectionRows(`apps/${APP_ID}/agents`),
    collectionRows(`apps/${APP_ID}/chefs`),
    collectionRows(`apps/${APP_ID}/professionals`),
    db.doc(`apps/${APP_ID}`).get(),
  ])

  if (!appSnapshot.exists) throw new Error(`Missing apps/${APP_ID}`)
  if (rootCustomers.size) {
    throw new Error(
      `Root Customer privacy migration is incomplete (${rootCustomers.size} documents).`
    )
  }

  return {
    users,
    appUsers,
    rootDrivers,
    appDrivers,
    appCustomers,
    joinRequests,
    rootProfiles: {
      agents: rootAgents,
      chefs: rootChefs,
      professionals: rootProfessionals,
    },
    appProfiles: {
      agents: appAgents,
      chefs: appChefs,
      professionals: appProfessionals,
    },
    app: {
      path: appSnapshot.ref.path,
      ref: appSnapshot.ref,
      data: appSnapshot.data() || {},
      updateTime: appSnapshot.updateTime,
    },
  }
}

function buildPlan(state) {
  const patches = []

  for (const [id, row] of state.users) {
    const data = row.data
    const displayName = text(data.display_name)
    const handle = text(data.handle).toLowerCase()
    if (!displayName || !handle) {
      throw new Error(`users/${id} is missing public identity fields.`)
    }
    if (!/^[a-z0-9][a-z0-9-]{2,29}$/.test(handle)) {
      throw new Error(`users/${id} has an invalid public handle: ${handle}`)
    }
    if (Array.isArray(data.notifications) && data.notifications.length) {
      throw new Error(
        `users/${id} has embedded notifications; run the private notification recovery first.`
      )
    }
    const legacyBio = text(data.bio)
    if (legacyBio && legacyBio.localeCompare(displayName, undefined, {
      sensitivity: 'accent',
    }) !== 0) {
      throw new Error(
        `users/${id} has a meaningful legacy bio; run the profile-data recovery first.`
      )
    }

    const appIds = stringList(data.app_ids)
    const hasMembership = state.appUsers.has(id)
    const nextAppIds = hasMembership
      ? [...new Set([...appIds, APP_ID])]
      : appIds.filter((appId) => appId !== APP_ID)
    const patch = deleteUnknown(data, USER_KEYS)
    setIfChanged(patch, data, 'display_name', displayName)
    setIfChanged(patch, data, 'handle', handle)
    setIfChanged(
      patch,
      data,
      'avatar',
      text(data.avatar) || '/img/ecosystem/avatar.png'
    )
    setIfChanged(patch, data, 'app_ids', nextAppIds)
    setIfChanged(patch, data, 'profiles', stringList(data.profiles, 20))
    requireTimestampStamp(data.created, `users/${id}.created`)
    requireTimestampStamp(data.updated, `users/${id}.updated`)
    pushPatch(patches, row, patch)
  }

  for (const [id, row] of state.appUsers) {
    if (!state.users.has(id)) {
      throw new Error(`apps/${APP_ID}/users/${id} has no public User.`)
    }
    const data = row.data
    if (!['admin', 'user'].includes(data.role)) {
      throw new Error(`${row.path} has invalid role.`)
    }
    if (Array.isArray(data.notifications) && data.notifications.length) {
      throw new Error(
        `${row.path} has embedded notifications; migrate them to the owner-only notification subcollection first.`
      )
    }
    const patch = deleteUnknown(data, APP_USER_KEYS)
    setIfChanged(patch, data, 'is_premium', data.is_premium === true)
    setIfChanged(patch, data, 'console_enabled', data.console_enabled === true)
    const profiles = stringList(data.profiles, 20)
    if (state.appCustomers.has(id) && !profiles.includes('customer')) {
      profiles.push('customer')
    }
    if (state.appDrivers.has(id) && !profiles.includes('driver')) {
      profiles.push('driver')
    }
    for (const [collectionName, profileId] of [
      ['agents', 'agent'],
      ['chefs', 'chef'],
      ['professionals', 'professional'],
    ]) {
      if (
        state.appProfiles[collectionName].has(id) &&
        !profiles.includes(profileId)
      ) {
        profiles.push(profileId)
      }
    }
    setIfChanged(patch, data, 'profiles', profiles)
    setIfChanged(
      patch,
      data,
      'console_targets',
      normalizeConsoleTargets(data.console_targets)
    )
    requireTimestampStamp(data.created, `${row.path}.created`)
    requireTimestampStamp(data.updated, `${row.path}.updated`)
    pushPatch(patches, row, patch)
  }

  for (const [id, row] of state.rootDrivers) {
    const patch = deleteUnknown(row.data, DRIVER_KEYS)
    requireCanonicalUser(state, id)
    const coverage = object(row.data.coverage)
    const radius = Number(coverage.radius_m)
    setIfChanged(patch, row.data, 'coverage', {
      radius_m: Number.isInteger(radius) && radius >= 0 && radius <= 200000
        ? radius
        : 1500,
    })
    requireTimestampStamp(row.data.created, `${row.path}.created`)
    requireTimestampStamp(row.data.updated, `${row.path}.updated`)
    pushPatch(patches, row, patch)
  }

  for (const [id, row] of state.appDrivers) {
    const patch = deleteUnknown(row.data, APP_DRIVER_KEYS)
    const links = Array.isArray(row.data.kitchen_links)
      ? row.data.kitchen_links.slice(0, 50)
      : []
    const activeKitchenIds = [
      ...new Set(
        links
          .filter((link) => link && link.active !== false)
          .map((link) => text(link?.kitchen_id))
          .filter(Boolean)
      ),
    ]
    setIfChanged(patch, row.data, 'driver_phone', text(row.data.driver_phone))
    setIfChanged(
      patch,
      row.data,
      'accepts_weak_pings',
      row.data.accepts_weak_pings !== false
    )
    setIfChanged(
      patch,
      row.data,
      'accepts_delivery_tenders',
      row.data.accepts_delivery_tenders !== false
    )
    setIfChanged(patch, row.data, 'kitchen_links', links)
    setIfChanged(patch, row.data, 'active_kitchen_ids', activeKitchenIds)
    pushPatch(patches, row, patch)
  }

  for (const row of state.appCustomers.values()) {
    const patch = deleteUnknown(row.data, CUSTOMER_KEYS)
    const source = object(row.data.private)
    const privateData = Object.fromEntries(
      [...CUSTOMER_PRIVATE_KEYS].map((key) => {
        if (key === 'saved_addresses' || key === 'order_history') {
          return [key, Array.isArray(source[key]) ? source[key] : []]
        }
        return [key, text(source[key])]
      })
    )
    setIfChanged(patch, row.data, 'private', privateData)
    pushPatch(patches, row, patch)
  }

  for (const [collectionName, rows] of Object.entries(state.rootProfiles)) {
    const allowedKeys = ROOT_PROFILE_KEYS[collectionName]
    for (const [id, row] of rows) {
      const patch = deleteUnknown(row.data, allowedKeys)
      requireCanonicalUser(state, id)
      requireTimestampStamp(row.data.created, `${row.path}.created`)
      requireTimestampStamp(row.data.updated, `${row.path}.updated`)
      pushPatch(patches, row, patch)
    }
  }

  for (const rows of Object.values(state.appProfiles)) {
    for (const row of rows.values()) {
      const patch = deleteUnknown(row.data, PROFILE_OVERLAY_KEYS)
      pushPatch(patches, row, patch)
    }
  }
  const adminIds = [...state.appUsers]
    .filter(([, row]) => row.data.role === 'admin')
    .map(([id]) => id)
  if (!adminIds.length) throw new Error('The App has no canonical admin membership.')
  if (text(state.app.data.moderation_state)) {
    throw new Error('The public App contains a non-empty moderation_state.')
  }
  if (stringList(state.app.data.ban_reasons, 100).length) {
    throw new Error('The public App contains non-empty ban_reasons.')
  }
  const legacyJoinRequests = stringList(state.app.data.join_requests, 200)
  for (const userId of legacyJoinRequests) {
    if (state.joinRequests.has(userId)) continue
    const ref = db.doc(`apps/${APP_ID}/join-requests/${userId}`)
    patches.push({
      path: ref.path,
      ref,
      data: null,
      operation: 'create',
      patch: {
        user_id: userId,
        created: {
          at: Timestamp.now(),
          by: 'system:user-security-hardening',
          app_id: APP_ID,
        },
      },
    })
  }
  const appPatch = deleteUnknown(state.app.data, APP_KEYS)
  setIfChanged(appPatch, state.app.data, 'self_join_enabled', true)
  setIfChanged(appPatch, state.app.data, 'derived', {
    user_count: state.appUsers.size,
  })
  if ('join_requests' in state.app.data) {
    appPatch.join_requests = FieldValue.delete()
  }
  if (Object.keys(appPatch).length) {
    appPatch.updated = {
      at: Timestamp.now(),
      by: 'system:user-security-hardening',
    }
    patches.push({ ...state.app, patch: appPatch })
  }

  return {
    patches,
    summary: {
      target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
      credentialSource: credential.source,
      counts: {
        users: state.users.size,
        appUsers: state.appUsers.size,
        rootDrivers: state.rootDrivers.size,
        appDrivers: state.appDrivers.size,
        appCustomers: state.appCustomers.size,
        rootIdentityProfiles: Object.values(state.rootProfiles)
          .reduce((count, rows) => count + rows.size, 0),
        appIdentityProfiles: Object.values(state.appProfiles)
          .reduce((count, rows) => count + rows.size, 0),
        joinRequests: state.joinRequests.size + legacyJoinRequests.length,
      },
      documentsToUpdate: patches.filter((row) => Object.keys(row.patch).length).length,
      legacyUserFieldsToDelete: patches
        .filter((row) => row.path.startsWith('users/'))
        .reduce(
          (count, row) =>
            count + Object.values(row.patch).filter(isDeleteSentinel).length,
          0
        ),
    },
  }
}

function pushPatch(patches, row, patch) {
  if (!Object.keys(patch).length) return
  patch.updated = {
    at: Timestamp.now(),
    by: 'system:user-security-hardening',
  }
  patches.push({ ...row, patch })
}

function deleteUnknown(data, allowed) {
  return Object.fromEntries(
    Object.keys(data)
      .filter((key) => !allowed.has(key))
      .map((key) => [key, FieldValue.delete()])
  )
}

function normalizeConsoleTargets(value) {
  const source = object(value)
  const keys = new Set([...Object.keys(source), ...REQUIRED_CONSOLE_TARGETS])
  return Object.fromEntries(
    [...keys]
      .filter((key) => /^[a-z][a-z0-9_]{0,63}$/.test(key))
      .map((key) => [key, stringList(source[key], 50)])
  )
}

function requireCanonicalUser(state, id) {
  const row = state.users.get(id)
  if (!row) throw new Error(`Missing canonical users/${id}.`)
  const displayName = text(row.data.display_name)
  const handle = text(row.data.handle).toLowerCase()
  if (!displayName || !/^[a-z0-9][a-z0-9-]{2,29}$/.test(handle)) {
    throw new Error(`users/${id} is not a valid canonical identity.`)
  }
}

function setIfChanged(patch, current, key, next) {
  if (JSON.stringify(serialize(current[key])) !== JSON.stringify(serialize(next))) {
    patch[key] = next
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function stringList(value, max = 50) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(text).filter(Boolean))].slice(0, max)
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function requireTimestampStamp(value, path) {
  if (!value || typeof value !== 'object' || typeof value.at?.toMillis !== 'function') {
    throw new Error(`${path} must contain a Firestore timestamp.`)
  }
}

function isDeleteSentinel(value) {
  return value?.constructor?.name === 'DeleteTransform'
}

async function writeBackup(plan) {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-user-security-${stamp}.json`
  const backup = {
    format: 'fireux-user-security-backup/1',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
    documents: plan.patches.map((row) => ({
      path: row.path,
      updateTime: row.updateTime?.toDate?.().toISOString() || null,
      data: serialize(row.data),
    })),
  }
  await writeFile(path, `${JSON.stringify(backup, null, 2)}\n`, {
    flag: 'wx',
    mode: 0o600,
  })
  return path
}

async function applyPlan(plan) {
  const batch = db.batch()
  for (const row of plan.patches) {
    if (row.operation === 'create') batch.create(row.ref, row.patch)
    else batch.update(row.ref, row.patch, { lastUpdateTime: row.updateTime })
  }
  batch.set(db.doc(MIGRATION_MARKER_PATH), {
    schema_version: 3,
    complete: true,
    completed_at: FieldValue.serverTimestamp(),
    app_id: APP_ID,
    user_count: plan.summary.counts.users,
    app_user_count: plan.summary.counts.appUsers,
    root_profile_count:
      plan.summary.counts.rootDrivers +
      plan.summary.counts.rootIdentityProfiles,
  })
  await batch.commit()
}

async function verify() {
  const state = await readState()
  const migrationMarker = await db.doc(MIGRATION_MARKER_PATH).get()
  const failures = []
  for (const row of state.users.values()) {
    const unknown = Object.keys(row.data).filter((key) => !USER_KEYS.has(key))
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
  }
  for (const row of state.appUsers.values()) {
    const unknown = Object.keys(row.data).filter((key) => !APP_USER_KEYS.has(key))
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
  }
  for (const row of state.rootDrivers.values()) {
    const unknown = Object.keys(row.data).filter((key) => !DRIVER_KEYS.has(key))
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    const radius = Number(object(row.data.coverage).radius_m)
    if (!Number.isInteger(radius) || radius < 0 || radius > 200000) {
      failures.push(`${row.path}.coverage.radius_m is invalid`)
    }
  }
  for (const row of state.appDrivers.values()) {
    const unknown = Object.keys(row.data).filter((key) => !APP_DRIVER_KEYS.has(key))
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
  }
  const rootProfileRows = [
    ...state.rootDrivers.entries(),
    ...Object.values(state.rootProfiles)
      .flatMap((rows) => [...rows.entries()]),
  ]
  for (const [id, row] of rootProfileRows) {
    if ('user' in row.data) failures.push(`${row.path} still embeds user`)
    try {
      requireCanonicalUser(state, id)
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error))
    }
  }
  for (const rows of Object.values(state.appProfiles)) {
    for (const row of rows.values()) {
      const unknown = Object.keys(row.data)
        .filter((key) => !PROFILE_OVERLAY_KEYS.has(key))
      if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    }
  }
  for (const [collectionName, rows] of Object.entries(state.rootProfiles)) {
    const allowedKeys = ROOT_PROFILE_KEYS[collectionName]
    for (const row of rows.values()) {
      const unknown = Object.keys(row.data)
        .filter((key) => !allowedKeys.has(key))
      if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    }
  }
  const appData = state.app.data
  if ('join_requests' in appData) {
    failures.push('apps/misebox-app still contains legacy join_requests')
  }
  const admins = [...state.appUsers]
    .filter(([, row]) => row.data.role === 'admin')
    .map(([id]) => id)
  if ('admin_ids' in appData) {
    failures.push('apps/misebox-app still exposes legacy admin_ids')
  }
  if (Number(appData.derived?.user_count) !== state.appUsers.size) {
    failures.push('apps/misebox-app.derived.user_count is not authoritative')
  }
  const rootProfileCount = state.rootDrivers.size + Object.values(state.rootProfiles)
    .reduce((count, rows) => count + rows.size, 0)
  if (
    !migrationMarker.exists ||
    migrationMarker.get('schema_version') !== 3 ||
    migrationMarker.get('complete') !== true ||
    migrationMarker.get('app_id') !== APP_ID ||
    migrationMarker.get('user_count') !== state.users.size ||
    migrationMarker.get('app_user_count') !== state.appUsers.size ||
    migrationMarker.get('root_profile_count') !== rootProfileCount
  ) {
    failures.push(`${MIGRATION_MARKER_PATH} is missing or stale`)
  }
  if (failures.length) {
    throw new Error(`Verification failed:\n- ${failures.join('\n- ')}`)
  }
  return {
    publicUsersStrict: state.users.size,
    appUsersStrict: state.appUsers.size,
    publicDriversStrict: state.rootDrivers.size,
    appDriversStrict: state.appDrivers.size,
    domainOnlyRootProfiles: rootProfileRows.length,
    canonicalAdminIds: admins,
    migrationMarker: MIGRATION_MARKER_PATH,
  }
}

function serialize(value) {
  if (value == null) return value
  if (value instanceof Timestamp) {
    return {
      __type: 'firestore/timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (Array.isArray(value)) return value.map(serialize)
  if (typeof value === 'object') {
    if (value.constructor?.name === 'DeleteTransform') {
      return { __type: 'firestore/delete' }
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, serialize(entry)])
    )
  }
  return value
}
