#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: backup and normalize Misebox User, app membership, and domain-only profile documents before hardened rules deploy.
// Concurrent edit — 2026-07-20 12:50 CEST — Security spine: protect migration writes with read-version preconditions and keep App governance private.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: strip embedded User snapshots and verify uid joins.
// Concurrent edit — 2026-07-20 13:42 CEST — Security rollout gate: record the verified profile-boundary migration before Rules promotion.
// Concurrent edit — 2026-07-20 19:40 CEST — Repo Efficiency Pass 2 of 6: attest canonical profiles and fail closed on unsafe provider Place URLs.

import process from 'node:process'
import { createHash } from 'node:crypto'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const APP_ID = 'misebox-app'
const USER_ECOSYSTEM_AVATAR_SRC = '/img/ecosystem/avatar.png'
const MIGRATION_MARKER_PATH = 'security-migrations/user-profile-boundary-v4'
const PROFILE_SHAPE_MARKER_PATH =
  'security-migrations/user-profile-canonical-shape-v1'
const PROFILE_INTEGRITY_MARKER_PATH =
  'security-migrations/user-profile-integrity-v1'
const HISTORICAL_BACKUP_SHA256 =
  '2ffee41f8e29581450ae44783e1944353e79d0d93069863100ba722e8731d0ee'
const AUDITED_HISTORICAL_BIOS = [
  {
    userId: 'WjqzWuxCtOQ2gRALFAzzOscUHTV2',
    sha256: '998747a1f254ab3a8d7457d00ba3afb0f3de5deff5a173662119bef09177651b',
  },
  {
    userId: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
    sha256: '1a2b4fa6d92d4398282fff1e57e45f42a518bee41cd34c04574b31b1a1039e9c',
  },
]
const args = parseArgs(process.argv.slice(2))
const commit = args.commit
const MAX_CHEF_GALLERY_ITEMS = 6
const CUTOVER_COUNTS = Object.freeze({
  users: 27,
  appUsers: 26,
  rootProfiles: 16,
})
const PROFILE_SHAPE_COUNTS = Object.freeze({
  documentsUpdated: 13,
  fieldsBackfilled: 48,
  agentsUpdated: 2,
  chefsUpdated: 3,
  professionalsUpdated: 8,
  experienceItemsNormalized: 27,
})
const PROFILE_SHAPE_MARKER_KEYS = new Set([
  'schema_version',
  'complete',
  'no_legacy_compatibility',
  'completed_at',
  'project_id',
  'database_id',
  'app_id',
  'source_backup_sha256',
  'predecessor_marker_path',
  'predecessor_source_backup_sha256',
  'documents_updated',
  'fields_backfilled',
  'agent_documents_updated',
  'chef_documents_updated',
  'professional_documents_updated',
  'experience_items_normalized',
])
const PROFILE_INTEGRITY_PLACE_IDS = Object.freeze(
  [
    'ChIJ5a7zI4yZb0gREnXFLyK2efw',
    'ChIJEbkWR0ijj0cRiHfShuHPLcc',
    'ChIJW24UWZEFR0YRLz8DJUFmfes',
    'ChIJXdh4fWQzGQ0RMxS3c5Nua04',
    'ChIJd5U3YbF0iUcR-oLtm9B0M5Y',
  ].sort()
)
const PROFILE_INTEGRITY_COUNTS = Object.freeze({
  documentsUpdated: 1,
  urlsNormalized: 1,
  placesCreated: PROFILE_INTEGRITY_PLACE_IDS.length,
})
const PROFILE_INTEGRITY_MARKER_KEYS = new Set([
  'schema_version',
  'complete',
  'no_legacy_compatibility',
  'completed_at',
  'project_id',
  'database_id',
  'app_id',
  'source_backup_sha256',
  'predecessor_marker_path',
  'predecessor_source_backup_sha256',
  'documents_updated',
  'urls_normalized',
  'places_created',
  'place_ids',
  'place_payload_sha256',
])

const ROOT_PROFILE_DEFAULTS = {
  agents: () => ({
    title: '',
    summary: '',
    agent_bio: '',
    agent_image: '',
    agent_placement_types: [],
    agent_coverage_areas: [],
    agent_contact_email: '',
    agent_contact_phone: '',
    agent_website_url: '',
    subtitle: '',
    tagline: '',
    tags: [],
  }),
  chefs: () => ({
    title: '',
    summary: '',
    chef_bio: '',
    chef_image: '',
    chef_signature_dishes: [],
    chef_gallery: [],
    kitchen_ids: [],
    chef_organization_name: '',
  }),
  professionals: () => ({
    title: '',
    subtitle: '',
    tagline: '',
    summary: '',
    bio: '',
    image: '',
    positions: [],
    tags: [],
    relevant_experience: [],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  }),
}

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
    'created',
    'updated',
  ]),
  chefs: new Set([
    'title',
    'summary',
    'chef_bio',
    'chef_image',
    'chef_signature_dishes',
    'chef_gallery',
    'kitchen_ids',
    'chef_organization_name',
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
  node scripts/harden-misebox-user-security.mjs --historical-backup <path>
  node scripts/harden-misebox-user-security.mjs --historical-backup <path> --commit

Dry-run is the default. --commit writes a mode-0600 JSON backup under
/private/tmp before deleting obsolete source fields, then verifies the
canonical boundary. No legacy fields or compatibility copies are retained.

The first v4 run requires the protected historical backup whose exact digest
is pinned by this script. Its marker advances the script to the canonical
profile-shape phase. Once all markers exist, every command shape verifies the
strict dataset and never replays a completed cutover.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
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
  if (state.profileIntegrityMarker.exists) {
    const verification = await verifyProfileIntegrityCompletion(
      state.migrationMarker,
      state.profileShapeMarker,
      state.profileIntegrityMarker
    )
    console.log(
      JSON.stringify(
        {
          mode: 'already-complete',
          target: {
            projectId: PROJECT_ID,
            databaseId: DATABASE_ID,
            appId: APP_ID,
          },
          verification,
        },
        null,
        2
      )
    )
  } else if (state.profileShapeMarker.exists) {
    const shapeVerification = await verifyCanonicalProfileCompletion(
      state.migrationMarker,
      state.profileShapeMarker
    )
    const plan = await buildProfileIntegrityPlan(state, {
      fetchMissingPlaces: commit,
    })
    if (!commit) {
      console.log(
        JSON.stringify(
          {
            mode: 'dry-run-profile-integrity',
            ...plan.summary,
            shapeVerification,
          },
          null,
          2
        )
      )
    } else {
      const backup = await writeProfileIntegrityBackup(plan, state)
      await applyProfileIntegrityPlan(plan, backup.sha256, state)
      const verification = await verifyProfileIntegrityCompletion(
        state.migrationMarker,
        state.profileShapeMarker,
        null,
        backup.sha256
      )
      console.log(
        JSON.stringify(
          {
            mode: 'commit-profile-integrity',
            backupPath: backup.path,
            backupSha256: backup.sha256,
            ...plan.summary,
            shapeVerification,
            verification,
          },
          null,
          2
        )
      )
    }
  } else if (state.migrationMarker.exists) {
    const boundaryVerification = await verifyExistingMarker(
      state.migrationMarker
    )
    const plan = buildCanonicalProfilePlan(state)
    if (!commit) {
      console.log(
        JSON.stringify(
          {
            mode: 'dry-run-profile-shape',
            ...plan.summary,
            boundaryVerification,
          },
          null,
          2
        )
      )
    } else {
      const backup = await writeCanonicalProfileBackup(plan, state)
      await applyCanonicalProfilePlan(plan, backup.sha256, state)
      const verification = await verifyCanonicalProfileCompletion(
        state.migrationMarker,
        null,
        backup.sha256
      )
      console.log(
        JSON.stringify(
          {
            mode: 'commit-profile-shape',
            backupPath: backup.path,
            backupSha256: backup.sha256,
            ...plan.summary,
            boundaryVerification,
            verification,
          },
          null,
          2
        )
      )
    }
  } else {
    const historical = await readHistoricalBackup(args.historicalBackup)
    const plan = buildPlan(state, historical)
    assertCutoverCounts(plan.summary.counts)

    if (!commit) {
      console.log(JSON.stringify({ mode: 'dry-run', ...plan.summary }, null, 2))
    } else {
      const pendingNotificationCreates = plan.notifications.filter(
        (row) => !row.current
      ).length
      if (!plan.patches.length && !pendingNotificationCreates) {
        if (!state.migrationMarker.exists) {
          throw new Error('No canonical cutover changes are pending.')
        }
        const verification = await verifyExistingMarker(state.migrationMarker)
        console.log(
          JSON.stringify(
            {
              mode: 'already-complete',
              target: plan.summary.target,
              verification,
            },
            null,
            2
          )
        )
      } else {
        const backup = await writeBackup(plan, state, historical)
        await applyPlan(plan, backup.sha256, historical.sha256)
        const verification = await verify(
          backup.sha256,
          plan.summary,
          plan.notifications.map((row) => row.path),
          plan.historicalBios.records,
          {
            verifyHistoricalBioState: true,
            verifyNotificationPayload: true,
          }
        )
        console.log(
          JSON.stringify(
            {
              mode: 'commit',
              backupPath: backup.path,
              backupSha256: backup.sha256,
              ...plan.summary,
              verification,
            },
            null,
            2
          )
        )
      }
    }
  }
} finally {
  await deleteApp(adminApp)
}

function parseArgs(values) {
  const parsed = {
    commit: false,
    historicalBackup: '',
  }
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (value === '--commit') parsed.commit = true
    else if (value === '--help') continue
    else if (value === '--historical-backup') {
      const path = String(values[index + 1] || '').trim()
      if (!path || path.startsWith('--')) {
        throw new Error('--historical-backup requires an absolute path.')
      }
      parsed.historicalBackup = path
      index += 1
    } else {
      throw new Error(`Unknown argument: ${value}`)
    }
  }
  return parsed
}

function assertCutoverCounts(counts) {
  const rootProfiles = counts.rootDrivers + counts.rootIdentityProfiles
  if (
    counts.users !== CUTOVER_COUNTS.users ||
    counts.appUsers !== CUTOVER_COUNTS.appUsers ||
    rootProfiles !== CUTOVER_COUNTS.rootProfiles
  ) {
    throw new Error(
      'The live source counts no longer match the audited v4 cutover dataset.'
    )
  }
}

async function readHistoricalBackup(path) {
  if (!path) {
    throw new Error(
      `The initial v4 cutover requires --historical-backup with SHA-256 ${HISTORICAL_BACKUP_SHA256}.`
    )
  }
  if (!path.startsWith('/private/tmp/')) {
    throw new Error('The historical backup must be read from /private/tmp/.')
  }
  const metadata = await stat(path)
  if (!metadata.isFile() || (metadata.mode & 0o077) !== 0) {
    throw new Error('The historical backup must be a mode-0600 regular file.')
  }
  const encoded = await readFile(path)
  const sha256 = createHash('sha256').update(encoded).digest('hex')
  if (sha256 !== HISTORICAL_BACKUP_SHA256) {
    throw new Error(
      `Historical backup SHA-256 mismatch: expected ${HISTORICAL_BACKUP_SHA256}, received ${sha256}.`
    )
  }
  const payload = JSON.parse(encoded.toString('utf8'))
  if (
    payload?.format !== 'fireux-user-security-backup/1' ||
    payload?.target?.projectId !== PROJECT_ID ||
    payload?.target?.databaseId !== DATABASE_ID ||
    payload?.target?.appId !== APP_ID ||
    !Array.isArray(payload?.documents)
  ) {
    throw new Error('Historical backup target or format is invalid.')
  }
  const documents = new Map()
  for (const document of payload.documents) {
    const documentPath = text(document?.path)
    if (!documentPath || documents.has(documentPath)) {
      throw new Error(
        'Historical backup contains an invalid or duplicate path.'
      )
    }
    documents.set(documentPath, deserializeBackup(document.data))
  }
  return {
    path,
    sha256,
    format: payload.format,
    documents,
  }
}

function deserializeBackup(value) {
  if (value == null) return value
  if (Array.isArray(value)) return value.map(deserializeBackup)
  if (typeof value !== 'object') return value
  if (value.__type === 'firestore/timestamp') {
    const seconds = Number(value.seconds)
    const nanoseconds = Number(value.nanoseconds)
    if (!Number.isSafeInteger(seconds) || !Number.isInteger(nanoseconds)) {
      throw new Error('Historical backup contains an invalid timestamp.')
    }
    return new Timestamp(seconds, nanoseconds)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, deserializeBackup(entry)])
  )
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
    rootPlaces,
    rootCompanies,
    rootKitchens,
    appKitchens,
    appSnapshot,
    migrationMarker,
    profileShapeMarker,
    profileIntegrityMarker,
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
    collectionRows('places'),
    collectionRows('companies'),
    collectionRows('kitchens'),
    collectionRows(`apps/${APP_ID}/kitchens`),
    db.doc(`apps/${APP_ID}`).get(),
    db.doc(MIGRATION_MARKER_PATH).get(),
    db.doc(PROFILE_SHAPE_MARKER_PATH).get(),
    db.doc(PROFILE_INTEGRITY_MARKER_PATH).get(),
  ])

  if (!appSnapshot.exists) throw new Error(`Missing apps/${APP_ID}`)
  if (rootCustomers.size) {
    throw new Error(
      `Root Customer privacy migration is incomplete (${rootCustomers.size} documents).`
    )
  }

  const notificationCollections = await Promise.all(
    [...users.keys()].map((id) => collectionRows(`users/${id}/notifications`))
  )
  const userNotifications = new Map(
    notificationCollections.flatMap((rows) =>
      [...rows.values()].map((row) => [row.path, row])
    )
  )

  return {
    users,
    appUsers,
    rootDrivers,
    appDrivers,
    appCustomers,
    rootPlaces,
    rootCompanies,
    rootKitchens,
    appKitchens,
    userNotifications,
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
    migrationMarker,
    profileShapeMarker,
    profileIntegrityMarker,
  }
}

function buildPlan(state, historical) {
  const patches = []
  const notificationPlan = buildNotificationPlan(state, historical)
  const notifications = notificationPlan.rows
  const historicalBios = buildHistoricalBioPlan(state, historical)
  let chefGalleryEntriesMigrated = 0
  let chefKitchenIdsMigrated = 0
  let danglingChefKitchenSnapshots = 0

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
    const avatar = text(data.avatar)
    if (!avatar || avatar.length > 2_048) {
      throw new Error(`users/${id} is missing a valid canonical avatar.`)
    }
    if (displayName.length > 120) {
      throw new Error(`users/${id}.display_name exceeds 120 characters.`)
    }

    const appIds = stringList(data.app_ids)
    const hasMembership = state.appUsers.has(id)
    const nextAppIds = hasMembership
      ? [...new Set([...appIds, APP_ID])]
      : appIds.filter((appId) => appId !== APP_ID)
    const patch = deleteUnknown(data, USER_KEYS)
    assertOnlyDeletedFields(patch, row, ['notifications'])
    setIfChanged(patch, data, 'display_name', displayName)
    setIfChanged(patch, data, 'handle', handle)
    setIfChanged(patch, data, 'avatar', avatar)
    setIfChanged(patch, data, 'app_ids', nextAppIds)
    const profiles = [
      state.rootProfiles.agents.has(id) ? 'agent' : '',
      state.rootProfiles.chefs.has(id) ? 'chef' : '',
      state.rootDrivers.has(id) ? 'driver' : '',
      state.rootProfiles.professionals.has(id) ? 'professional' : '',
    ].filter(Boolean)
    setIfChanged(patch, data, 'profiles', profiles)
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
    const patch = deleteUnknown(data, APP_USER_KEYS)
    assertOnlyDeletedFields(patch, row, ['notifications'])
    setIfChanged(patch, data, 'is_premium', data.is_premium === true)
    setIfChanged(patch, data, 'console_enabled', data.console_enabled === true)
    const profiles = [
      state.appProfiles.agents.has(id) ? 'agent' : '',
      state.appProfiles.chefs.has(id) ? 'chef' : '',
      state.appCustomers.has(id) ? 'customer' : '',
      state.appDrivers.has(id) ? 'driver' : '',
      state.appProfiles.professionals.has(id) ? 'professional' : '',
    ].filter(Boolean)
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
    assertOnlyDeletedFields(patch, row, ['user'])
    requireCanonicalUser(state, id)
    const coverage = object(row.data.coverage)
    const radius = Number(coverage.radius_m)
    setIfChanged(patch, row.data, 'coverage', {
      radius_m:
        Number.isInteger(radius) && radius >= 0 && radius <= 200000
          ? radius
          : 1500,
    })
    requireTimestampStamp(row.data.created, `${row.path}.created`)
    requireTimestampStamp(row.data.updated, `${row.path}.updated`)
    pushPatch(patches, row, patch)
  }

  for (const [id, row] of state.appDrivers) {
    if (!state.rootDrivers.has(id) || !state.appUsers.has(id)) {
      throw new Error(`${row.path} has no canonical Driver membership.`)
    }
    const patch = deleteUnknown(row.data, APP_DRIVER_KEYS)
    assertOnlyDeletedFields(patch, row, ['user'])
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

  for (const [id, row] of state.appCustomers) {
    if (!state.users.has(id) || !state.appUsers.has(id)) {
      throw new Error(`${row.path} has no canonical User membership.`)
    }
    const patch = deleteUnknown(row.data, CUSTOMER_KEYS)
    assertOnlyDeletedFields(patch, row, ['user'])
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
      const approvedDeletes = {
        agents: [
          'badges',
          'bio_short',
          'contact_email',
          'contact_phone',
          'user',
          'website_url',
        ],
        chefs: [
          'bio_long',
          'bio_short',
          'created_at_iso_backup',
          'display_name',
          'gallery',
          'kitchens',
          'name',
          'specialties',
          'subtitle',
          'tagline',
          'tags',
          'locations',
          'organization_name',
          'user',
        ],
        professionals: ['user'],
      }
      assertOnlyDeletedFields(patch, row, approvedDeletes[collectionName])
      requireCanonicalUser(state, id)
      if (collectionName === 'agents') {
        migrateTextField(patch, row, 'bio_short', 'summary')
        migrateStringListField(patch, row, 'badges', 'tags', 20)
        migrateTextField(patch, row, 'contact_email', 'agent_contact_email')
        migrateTextField(patch, row, 'contact_phone', 'agent_contact_phone')
        migrateTextField(patch, row, 'website_url', 'agent_website_url')
      }
      if (collectionName === 'chefs') {
        migrateTextField(patch, row, 'bio_short', 'summary')
        migrateTextField(patch, row, 'bio_long', 'chef_bio')
        migrateStringListField(
          patch,
          row,
          'specialties',
          'chef_signature_dishes',
          20
        )
        const gallery = migrateChefGallery(patch, row)
        chefGalleryEntriesMigrated += gallery.migrated
        const kitchens = migrateChefKitchenSnapshots(patch, row, state)
        chefKitchenIdsMigrated += kitchens.migrated
        danglingChefKitchenSnapshots += kitchens.dangling
        migrateTextField(
          patch,
          row,
          'organization_name',
          'chef_organization_name'
        )
        for (const obsoleteField of [
          'subtitle',
          'tagline',
          'tags',
          'locations',
        ]) {
          requireEmptyObsoleteField(row, obsoleteField)
        }
      }
      if (collectionName === 'professionals') {
        const historicalBio = historicalBios.byUserId.get(id)
        if (historicalBio?.apply) {
          setIfChanged(patch, row.data, 'bio', historicalBio.value)
        }
      }
      requireTimestampStamp(row.data.created, `${row.path}.created`)
      requireTimestampStamp(row.data.updated, `${row.path}.updated`)
      pushPatch(patches, row, patch)
    }
  }

  for (const [collectionName, rows] of Object.entries(state.appProfiles)) {
    for (const [id, row] of rows) {
      if (
        !state.rootProfiles[collectionName].has(id) ||
        !state.appUsers.has(id)
      ) {
        throw new Error(`${row.path} has no canonical root profile membership.`)
      }
      const patch = deleteUnknown(row.data, PROFILE_OVERLAY_KEYS)
      assertOnlyDeletedFields(patch, row, ['user'])
      for (const key of Object.keys(row.data)) {
        if (!PROFILE_OVERLAY_KEYS.has(key) && key !== 'user') {
          requireEmptyObsoleteField(row, key)
        }
      }
      pushPatch(patches, row, patch)
    }
  }
  const adminIds = [...state.appUsers]
    .filter(([, row]) => row.data.role === 'admin')
    .map(([id]) => id)
  if (!adminIds.length)
    throw new Error('The App has no canonical admin membership.')
  if (text(state.app.data.moderation_state)) {
    throw new Error('The public App contains a non-empty moderation_state.')
  }
  if (stringList(state.app.data.ban_reasons, 100).length) {
    throw new Error('The public App contains non-empty ban_reasons.')
  }
  const appPatch = deleteUnknown(state.app.data, APP_KEYS)
  assertOnlyDeletedFields(appPatch, state.app, ['admin_ids', 'join_requests'])
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
  if (
    state.migrationMarker.exists &&
    (patches.length || notifications.some((row) => !row.current))
  ) {
    throw new Error(
      `${MIGRATION_MARKER_PATH} exists while canonical changes are still pending.`
    )
  }

  return {
    patches,
    notifications,
    historicalBios,
    summary: {
      target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
      credentialSource: credential.source,
      counts: {
        users: state.users.size,
        appUsers: state.appUsers.size,
        rootDrivers: state.rootDrivers.size,
        appDrivers: state.appDrivers.size,
        appCustomers: state.appCustomers.size,
        rootIdentityProfiles: Object.values(state.rootProfiles).reduce(
          (count, rows) => count + rows.size,
          0
        ),
        appIdentityProfiles: Object.values(state.appProfiles).reduce(
          (count, rows) => count + rows.size,
          0
        ),
        joinRequests: state.joinRequests.size,
      },
      documentsToUpdate: patches.length,
      notificationDocumentsToCreate: notifications.filter((row) => !row.current)
        .length,
      obsoleteFieldsToDelete: patches.reduce(
        (count, row) =>
          count + Object.values(row.patch).filter(isDeleteSentinel).length,
        0
      ),
      embeddedNotificationsToDelete: notificationPlan.liveCount,
      historicalNotificationsExamined: notificationPlan.historicalCount,
      historicalNotificationsRecovered: notificationPlan.recoveredCount,
      historicalBiosExamined: historicalBios.records.length,
      historicalBiosApplied: historicalBios.records.filter(
        (row) => row.outcome === 'restored_to_empty_canonical'
      ).length,
      historicalBiosCurrentCanonicalRetained: historicalBios.records.filter(
        (row) => row.outcome === 'current_canonical_retained'
      ).length,
      historicalBioReconciliationSha256: historicalBios.sha256,
      embeddedUserSnapshotsToDelete: [
        ...state.rootDrivers.values(),
        ...state.appDrivers.values(),
        ...state.appCustomers.values(),
        ...Object.values(state.rootProfiles).flatMap((rows) => [
          ...rows.values(),
        ]),
        ...Object.values(state.appProfiles).flatMap((rows) => [
          ...rows.values(),
        ]),
      ].filter((row) => 'user' in row.data).length,
      chefGalleryEntriesMigrated,
      chefKitchenIdsMigrated,
      danglingChefKitchenSnapshots,
      notificationPayloadSha256: notificationPayloadSha256(notifications),
      changes: patches.map(describePatch),
    },
  }
}

function describePatch(row) {
  const deleteFields = Object.entries(row.patch)
    .filter(([, value]) => isDeleteSentinel(value))
    .map(([key]) => key)
    .sort()
  const setFields = Object.entries(row.patch)
    .filter(([, value]) => !isDeleteSentinel(value))
    .map(([key]) => key)
    .sort()
  return {
    path: row.path,
    operation: row.operation || 'update',
    deleteFields,
    setFields,
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

function assertOnlyDeletedFields(patch, row, approved) {
  const approvedSet = new Set(approved)
  const unexpected = Object.entries(patch)
    .filter(([, value]) => isDeleteSentinel(value))
    .map(([key]) => key)
    .filter((key) => !approvedSet.has(key))
  if (unexpected.length) {
    throw new Error(
      `${row.path} contains unclassified obsolete fields: ${unexpected.join(', ')}`
    )
  }
}

function buildNotificationPlan(state, historical) {
  const historicalRows = []
  const byFingerprint = new Map()
  const seenPaths = new Set()

  for (const [sourcePath, sourceData] of historical.documents) {
    const uid = notificationSourceUid(sourcePath)
    if (!uid) continue
    const notifications = Array.isArray(sourceData?.notifications)
      ? sourceData.notifications
      : []
    if (notifications.length && !state.users.has(uid)) {
      throw new Error(
        `${sourcePath} has historical notifications without a canonical User.`
      )
    }
    for (const [index, value] of notifications.entries()) {
      const data = normalizeNotification(value, sourcePath)
      const fingerprint = notificationFingerprint(uid, data)
      if (byFingerprint.has(fingerprint)) {
        throw new Error(
          `${sourcePath} contains a duplicate historical notification payload.`
        )
      }
      const digest = createHash('sha256')
        .update(
          JSON.stringify({
            sourcePath,
            index,
            notification: serialize(data),
          })
        )
        .digest('hex')
        .slice(0, 32)
      const path = `users/${uid}/notifications/cutover-${digest}`
      if (seenPaths.has(path)) {
        throw new Error(`Duplicate notification destination: ${path}`)
      }
      seenPaths.add(path)
      const row = { uid, fingerprint, path, data }
      historicalRows.push(row)
      byFingerprint.set(fingerprint, row)
    }
  }

  const liveFingerprints = new Set()
  for (const source of [...state.users.values(), ...state.appUsers.values()]) {
    const uid = notificationSourceUid(source.path)
    const notifications = Array.isArray(source.data.notifications)
      ? source.data.notifications
      : []
    if (notifications.length && !state.users.has(uid)) {
      throw new Error(
        `${source.path} has notifications without a canonical User.`
      )
    }
    for (const value of notifications) {
      const data = normalizeNotification(value, source.path)
      const fingerprint = notificationFingerprint(uid, data)
      if (liveFingerprints.has(fingerprint)) {
        throw new Error(
          `${source.path} contains a duplicate live notification.`
        )
      }
      if (!byFingerprint.has(fingerprint)) {
        throw new Error(
          `${source.path} contains notification data absent from the audited history.`
        )
      }
      liveFingerprints.add(fingerprint)
    }
  }

  if (historicalRows.length !== 23 || liveFingerprints.size !== 22) {
    throw new Error(
      `Audited notification counts changed (history ${historicalRows.length}, live ${liveFingerprints.size}).`
    )
  }

  const rows = historicalRows.map((row) => {
    const current = state.userNotifications.get(row.path) || null
    if (current && !sameValue(current.data, row.data)) {
      throw new Error(`${row.path} exists with different notification data.`)
    }
    return { ...row, ref: db.doc(row.path), current }
  })
  const recoveredCount = historicalRows.length - liveFingerprints.size
  if (recoveredCount !== 1) {
    throw new Error(
      `Expected one historical notification recovery, found ${recoveredCount}.`
    )
  }
  return {
    rows,
    historicalCount: historicalRows.length,
    liveCount: liveFingerprints.size,
    recoveredCount,
  }
}

function notificationSourceUid(path) {
  return (
    path.match(/^users\/([^/]+)$/)?.[1] ||
    path.match(new RegExp(`^apps/${APP_ID}/users/([^/]+)$`))?.[1] ||
    ''
  )
}

function notificationFingerprint(uid, data) {
  return createHash('sha256')
    .update(JSON.stringify({ uid, notification: serialize(data) }))
    .digest('hex')
}

function buildHistoricalBioPlan(state, historical) {
  const records = []
  const byUserId = new Map()
  for (const audited of AUDITED_HISTORICAL_BIOS) {
    const path = `users/${audited.userId}`
    const value = text(historical.documents.get(path)?.bio)
    if (!value || sha256Text(value) !== audited.sha256) {
      throw new Error(`${path}.bio does not match the audited history.`)
    }
    const professional = state.rootProfiles.professionals.get(audited.userId)
    if (!professional) {
      throw new Error(`${path}.bio has no canonical Professional destination.`)
    }
    const canonical = text(professional.data.bio)
    const historicalSha256 = sha256Text(value)
    const canonicalSha256 = sha256Text(canonical || value)
    const outcome =
      canonical === value
        ? 'identical'
        : canonical
          ? 'current_canonical_retained'
          : 'restored_to_empty_canonical'
    const record = {
      source_path: path,
      destination_path: professional.path,
      historical_sha256: historicalSha256,
      canonical_sha256: canonicalSha256,
      outcome,
    }
    records.push(record)
    byUserId.set(audited.userId, {
      apply: !canonical,
      value,
      record,
    })
  }
  records.sort((left, right) =>
    left.destination_path.localeCompare(right.destination_path)
  )
  if (
    records.length !== 2 ||
    records.some((row) => row.outcome !== 'current_canonical_retained')
  ) {
    throw new Error(
      'Audited historical bio reconciliation changed; manual review is required.'
    )
  }
  return {
    byUserId,
    records,
    sha256: historicalBioDecisionSha256(records),
  }
}

function historicalBioDecisionSha256(records) {
  const normalized = records.map((record) => ({
    source_path: text(record?.source_path),
    destination_path: text(record?.destination_path),
    historical_sha256: text(record?.historical_sha256),
    canonical_sha256: text(record?.canonical_sha256),
    outcome: text(record?.outcome),
  }))
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeNotification(value, sourcePath) {
  const data = object(value)
  const message = text(data.message)
  const scope =
    data.scope === 'app' ? 'app' : data.scope === 'ecosystem' ? 'ecosystem' : ''
  const created = object(data.created)
  const at = created.at
  const appId = text(created.app_id)
  if (
    !message ||
    message.length > 1_000 ||
    !scope ||
    !(at instanceof Timestamp) ||
    appId.length > 1_500
  ) {
    throw new Error(`${sourcePath} contains an invalid embedded notification.`)
  }
  return {
    message,
    scope,
    created: { at, app_id: appId },
    read: data.read === true,
  }
}

function notificationPayloadSha256(rows) {
  const payload = rows
    .map((row) => ({
      path: row.path,
      data: serialize(normalizeNotification(row.data, row.path)),
    }))
    .sort((left, right) => left.path.localeCompare(right.path))
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function migrateTextField(patch, row, sourceKey, targetKey) {
  const source = text(row.data[sourceKey])
  if (!source) return
  const target = text(row.data[targetKey])
  if (target && target !== source) {
    throw new Error(
      `${row.path} has conflicting ${sourceKey} and ${targetKey} values.`
    )
  }
  if (!target) patch[targetKey] = source
}

function migrateStringListField(patch, row, sourceKey, targetKey, max = 50) {
  const source = stringList(row.data[sourceKey], max)
  if (!source.length) return
  const target = stringList(row.data[targetKey], max)
  const merged = [...new Set([...target, ...source])]
  if (merged.length > max) {
    throw new Error(`${row.path}.${targetKey} exceeds the migration limit.`)
  }
  setIfChanged(patch, row.data, targetKey, merged)
}

function migrateChefGallery(patch, row) {
  const source = normalizeChefGallery(row.data.gallery, `${row.path}.gallery`)
  if (!source.length) return { migrated: 0 }
  const target = normalizeChefGallery(
    row.data.chef_gallery,
    `${row.path}.chef_gallery`
  )
  const merged = [...target]
  const byUrl = new Map(target.map((item, index) => [item.image_url, index]))
  for (const item of source) {
    const targetIndex = byUrl.get(item.image_url)
    if (targetIndex == null) {
      byUrl.set(item.image_url, merged.length)
      merged.push(item)
      continue
    }
    const current = merged[targetIndex]
    if (current.name && item.name && current.name !== item.name) {
      throw new Error(`${row.path}.gallery conflicts for ${item.image_url}.`)
    }
    if (!current.name && item.name) merged[targetIndex] = item
  }
  if (merged.length > MAX_CHEF_GALLERY_ITEMS) {
    throw new Error(
      `${row.path}.chef_gallery exceeds ${MAX_CHEF_GALLERY_ITEMS} items.`
    )
  }
  setIfChanged(patch, row.data, 'chef_gallery', merged)
  return { migrated: source.length }
}

function normalizeChefGallery(value, path) {
  if (value == null) return []
  if (!Array.isArray(value) || value.length > 20) {
    throw new Error(`${path} must be an array of at most 20 items.`)
  }
  return value.map((entry, index) => {
    const source = object(entry)
    const unknown = Object.keys(source).filter(
      (key) => !['name', 'image_url'].includes(key)
    )
    const name = text(source.name)
    const imageUrl = text(source.image_url)
    if (
      unknown.length ||
      name.length > 240 ||
      !imageUrl ||
      imageUrl.length > 2_048
    ) {
      throw new Error(`${path}[${index}] is not a valid Chef gallery item.`)
    }
    return { name, image_url: imageUrl }
  })
}

function migrateChefKitchenSnapshots(patch, row, state) {
  const snapshots = object(row.data.kitchens)
  const canonicalIds = []
  let dangling = 0
  for (const rawId of Object.keys(snapshots)) {
    const id = text(rawId)
    if (!id || id !== rawId) {
      throw new Error(`${row.path}.kitchens contains an invalid id.`)
    }
    if (state.rootKitchens.has(id) || state.appKitchens.has(id)) {
      canonicalIds.push(id)
    } else {
      dangling += 1
    }
  }
  const current = stringList(row.data.kitchen_ids, 50)
  const merged = [...new Set([...current, ...canonicalIds])]
  if (merged.length > 50) {
    throw new Error(`${row.path}.kitchen_ids exceeds 50 items.`)
  }
  setIfChanged(patch, row.data, 'kitchen_ids', merged)
  return { migrated: canonicalIds.length, dangling }
}

function requireEmptyObsoleteField(row, field) {
  const value = row.data[field]
  const empty =
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  if (!empty) {
    throw new Error(
      `${row.path}.${field} has no approved canonical migration target.`
    )
  }
}

function normalizeConsoleTargets(value) {
  const source = object(value)
  const extras = Object.keys(source)
    .filter((key) => !REQUIRED_CONSOLE_TARGETS.includes(key))
    .sort()
  const keys = [...REQUIRED_CONSOLE_TARGETS, ...extras]
  const invalid = [...keys].filter((key) => !/^[a-z][a-z0-9_]{0,63}$/.test(key))
  if (invalid.length) {
    throw new Error(
      `console_targets contains invalid keys: ${invalid.join(', ')}`
    )
  }
  if (keys.length > 20) {
    throw new Error('console_targets exceeds the 20-key limit.')
  }
  return Object.fromEntries(
    keys.map((key) => [key, stringList(source[key], 50)])
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
  if (!sameValue(current[key], next)) {
    patch[key] = next
  }
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function stringList(value, max = 50) {
  if (!Array.isArray(value)) return []
  const normalized = [...new Set(value.map(text).filter(Boolean))]
  if (normalized.length > max) {
    throw new Error(`String list exceeds the ${max}-item limit.`)
  }
  return normalized
}

function object(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function requireTimestampStamp(value, path) {
  if (
    !value ||
    typeof value !== 'object' ||
    typeof value.at?.toMillis !== 'function'
  ) {
    throw new Error(`${path} must contain a Firestore timestamp.`)
  }
}

function isDeleteSentinel(value) {
  return value?.constructor?.name === 'DeleteTransform'
}

function assertBoundaryMarker(marker) {
  const sourceBackupSha256 = marker?.get?.('source_backup_sha256')
  if (
    !marker?.exists ||
    marker.get('schema_version') !== 4 ||
    marker.get('complete') !== true ||
    marker.get('no_legacy_compatibility') !== true ||
    marker.get('app_id') !== APP_ID ||
    marker.get('user_count') !== CUTOVER_COUNTS.users ||
    marker.get('app_user_count') !== CUTOVER_COUNTS.appUsers ||
    marker.get('root_profile_count') !== CUTOVER_COUNTS.rootProfiles ||
    typeof marker.get('completed_at')?.toMillis !== 'function' ||
    marker.get('historical_source_backup_sha256') !==
      HISTORICAL_BACKUP_SHA256 ||
    marker.get('documents_updated') !== 66 ||
    marker.get('obsolete_fields_removed') !== 83 ||
    marker.get('embedded_notifications_deleted') !== 22 ||
    marker.get('canonical_notifications_migrated') !== 23 ||
    !Array.isArray(marker.get('notification_paths')) ||
    marker.get('notification_paths').length !== 23 ||
    marker.get('notification_payload_sha256') !==
      'b6f14795eb501f171344767e39e98291d424f9466d931b4d18adf646f3f00611' ||
    marker.get('historical_notifications_examined') !== 23 ||
    marker.get('historical_notifications_recovered') !== 1 ||
    marker.get('historical_bios_examined') !== 2 ||
    marker.get('historical_bios_applied') !== 0 ||
    marker.get('historical_bios_current_canonical_retained') !== 2 ||
    marker.get('historical_bio_reconciliation_sha256') !==
      'b00152772762d63969fee6074e39e9f1bee446ec7785be62c0a5a9e494db2d14' ||
    !Array.isArray(marker.get('historical_bio_decisions')) ||
    marker.get('historical_bio_decisions').length !== 2 ||
    marker.get('embedded_user_snapshots_deleted') !== 33 ||
    marker.get('chef_gallery_entries_migrated') !== 6 ||
    marker.get('chef_kitchen_ids_migrated') !== 0 ||
    marker.get('dangling_chef_kitchen_snapshots_deleted') !== 1 ||
    !/^[a-f0-9]{64}$/.test(String(sourceBackupSha256 || ''))
  ) {
    throw new Error(
      `${MIGRATION_MARKER_PATH} is not valid predecessor evidence.`
    )
  }
  return sourceBackupSha256
}

function assertExactKeySet(actual, expected, label) {
  const actualKeys = [...actual].sort()
  const expectedKeys = [...expected].sort()
  if (!sameValue(actualKeys, expectedKeys)) {
    throw new Error(`${label} does not match the canonical key set.`)
  }
}

function requireCanonicalProfileStamp(value, path, kind) {
  const allowedKeys =
    kind === 'created' ? new Set(['at', 'by', 'app_id']) : new Set(['at', 'by'])
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be a stamp map.`)
  }
  const unknown = Object.keys(value).filter((key) => !allowedKeys.has(key))
  if (
    unknown.length ||
    typeof value.at?.toMillis !== 'function' ||
    ('by' in value &&
      (typeof value.by !== 'string' || value.by.length > 1_500)) ||
    ('app_id' in value &&
      (typeof value.app_id !== 'string' || value.app_id.length > 1_500))
  ) {
    throw new Error(`${path} is not a canonical ${kind} stamp.`)
  }
}

function requireProfileTextFields(data, path, limits) {
  for (const [field, maxSize] of Object.entries(limits)) {
    if (
      Object.hasOwn(data, field) &&
      (typeof data[field] !== 'string' || data[field].length > maxSize)
    ) {
      throw new Error(`${path}.${field} is not a bounded string.`)
    }
  }
}

function requireProfileListFields(data, path, limits) {
  for (const [field, maxSize] of Object.entries(limits)) {
    if (
      Object.hasOwn(data, field) &&
      (!Array.isArray(data[field]) || data[field].length > maxSize)
    ) {
      throw new Error(`${path}.${field} is not a bounded list.`)
    }
  }
}

function requireStringList(data, path, field, maxItems, maxItemSize) {
  if (!Object.hasOwn(data, field)) return
  const value = data[field]
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`${path}.${field} is not a bounded string list.`)
  }
  for (const [index, item] of value.entries()) {
    if (typeof item !== 'string' || item.length > maxItemSize) {
      throw new Error(`${path}.${field}[${index}] is not a bounded string.`)
    }
  }
}

function requireExactMap(value, keys, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be a map.`)
  }
  if (!sameValue(Object.keys(value).sort(), [...keys].sort())) {
    throw new Error(`${path} does not match the canonical item shape.`)
  }
}

function requireMapString(value, field, path, minSize, maxSize) {
  const item = value[field]
  if (
    typeof item !== 'string' ||
    item.length < minSize ||
    item.length > maxSize
  ) {
    throw new Error(`${path}.${field} is not a bounded string.`)
  }
}

function isHttpsUrl(value, allowEmpty = true) {
  if (typeof value !== 'string') return false
  if (!value) return allowEmpty
  if (value.length > 2_048) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function requireHttpsMapValue(value, field, path, allowEmpty = true) {
  if (!isHttpsUrl(value[field], allowEmpty)) {
    throw new Error(
      `${path}.${field} must be ${allowEmpty ? 'empty or ' : ''}HTTPS.`
    )
  }
}

function isFirestoreDocumentId(value) {
  const segment = text(value)
  return (
    Boolean(segment) &&
    segment !== '.' &&
    segment !== '..' &&
    !segment.includes('/') &&
    !(segment.startsWith('__') && segment.endsWith('__')) &&
    new TextEncoder().encode(segment).length <= 1_500
  )
}

function requireExperienceMonth(value, field, path) {
  if (
    typeof value[field] !== 'string' ||
    ![
      '',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ].includes(value[field])
  ) {
    throw new Error(`${path}.${field} is not a canonical month.`)
  }
}

function requireExperienceYear(value, field, path) {
  if (
    typeof value[field] !== 'string' ||
    (value[field] !== '' && !/^[1-9][0-9]{3}$/.test(value[field]))
  ) {
    throw new Error(`${path}.${field} is not a canonical year.`)
  }
}

function requireYearValue(value, field, path) {
  const item = value[field]
  if (
    item !== null &&
    !(typeof item === 'string' && /^[1-9][0-9]{3}$/.test(item))
  ) {
    throw new Error(`${path}.${field} is not a canonical year value.`)
  }
}

function requireExperienceItem(value, path) {
  requireExactMap(
    value,
    [
      'role',
      'from_month',
      'from_year',
      'to_month',
      'to_year',
      'ongoing',
      'responsibilities',
      'place_id',
      'place_collection',
    ],
    path
  )
  requireMapString(value, 'role', path, 0, 160)
  requireExperienceMonth(value, 'from_month', path)
  requireExperienceYear(value, 'from_year', path)
  requireExperienceMonth(value, 'to_month', path)
  requireExperienceYear(value, 'to_year', path)
  requireMapString(value, 'responsibilities', path, 0, 4_000)
  if (!isFirestoreDocumentId(value.place_id)) {
    throw new Error(`${path}.place_id is not a Firestore document id.`)
  }
  if (!['', 'kitchens', 'companies'].includes(value.place_collection)) {
    throw new Error(`${path}.place_collection is not canonical.`)
  }
  if (typeof value.ongoing !== 'boolean') {
    throw new Error(`${path}.ongoing must be a boolean.`)
  }
}

function requireLanguageItem(value, path) {
  requireExactMap(value, ['language', 'proficiency'], path)
  requireMapString(value, 'language', path, 1, 120)
  requireMapString(value, 'proficiency', path, 0, 120)
}

function requireCertificationItem(value, path, requireSafeUrls = false) {
  requireExactMap(
    value,
    [
      'name',
      'year',
      'place_name',
      'formatted_address',
      'document_url',
      'image_url',
    ],
    path
  )
  requireMapString(value, 'name', path, 0, 240)
  requireYearValue(value, 'year', path)
  requireMapString(value, 'place_name', path, 0, 240)
  requireMapString(value, 'formatted_address', path, 0, 500)
  requireMapString(value, 'document_url', path, 0, 2_048)
  requireMapString(value, 'image_url', path, 0, 2_048)
  if (requireSafeUrls) {
    requireHttpsMapValue(value, 'document_url', path)
    requireHttpsMapValue(value, 'image_url', path)
  }
}

function requireEducationItem(value, path, requireSafeUrls = false) {
  requireExactMap(
    value,
    [
      'institution',
      'degree',
      'start_year',
      'end_year',
      'ongoing',
      'formatted_address',
      'document_url',
      'image_url',
    ],
    path
  )
  requireMapString(value, 'institution', path, 0, 240)
  requireMapString(value, 'degree', path, 0, 240)
  requireYearValue(value, 'start_year', path)
  requireYearValue(value, 'end_year', path)
  if (typeof value.ongoing !== 'boolean') {
    throw new Error(`${path}.ongoing must be a boolean.`)
  }
  requireMapString(value, 'formatted_address', path, 0, 500)
  requireMapString(value, 'document_url', path, 0, 2_048)
  requireMapString(value, 'image_url', path, 0, 2_048)
  if (requireSafeUrls) {
    requireHttpsMapValue(value, 'document_url', path)
    requireHttpsMapValue(value, 'image_url', path)
  }
}

function requireActivityItem(value, path, nameField) {
  requireExactMap(
    value,
    [nameField, 'role', 'from_year', 'to_year', 'ongoing', 'responsibilities'],
    path
  )
  requireMapString(value, nameField, path, 0, 240)
  requireMapString(value, 'role', path, 0, 160)
  requireYearValue(value, 'from_year', path)
  requireYearValue(value, 'to_year', path)
  if (typeof value.ongoing !== 'boolean') {
    throw new Error(`${path}.ongoing must be a boolean.`)
  }
  requireMapString(value, 'responsibilities', path, 0, 4_000)
}

function requireProfessionalItemList(
  data,
  path,
  field,
  maxItems,
  validateItem
) {
  if (!Object.hasOwn(data, field)) return
  const value = data[field]
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`${path}.${field} is not a bounded item list.`)
  }
  for (const [index, item] of value.entries()) {
    validateItem(item, `${path}.${field}[${index}]`)
  }
}

function requireChefGallery(data, path, requireSafeUrls = false) {
  if (!Object.hasOwn(data, 'chef_gallery')) return
  const gallery = data.chef_gallery
  if (!Array.isArray(gallery) || gallery.length > MAX_CHEF_GALLERY_ITEMS) {
    throw new Error(`${path}.chef_gallery is not a bounded gallery.`)
  }
  for (const [index, item] of gallery.entries()) {
    const keys =
      item && typeof item === 'object' && !Array.isArray(item)
        ? Object.keys(item).sort()
        : []
    if (
      !sameValue(keys, ['image_url', 'name']) ||
      typeof item.name !== 'string' ||
      item.name.length > 240 ||
      typeof item.image_url !== 'string' ||
      item.image_url.length < 1 ||
      item.image_url.length > 2_048
    ) {
      throw new Error(`${path}.chef_gallery[${index}] is not canonical.`)
    }
    if (requireSafeUrls) {
      requireHttpsMapValue(
        item,
        'image_url',
        `${path}.chef_gallery[${index}]`,
        false
      )
    }
  }
}

function requireCanonicalProfileData(
  collectionName,
  data,
  path,
  requireFull,
  options = {}
) {
  const requireSafeUrls = options.requireSafeUrls === true
  const allowedKeys = ROOT_PROFILE_KEYS[collectionName]
  if (!allowedKeys)
    throw new Error(`Unsupported profile family: ${collectionName}`)
  const unknown = Object.keys(data).filter((key) => !allowedKeys.has(key))
  if (unknown.length) {
    throw new Error(
      `${path} contains non-canonical fields: ${unknown.join(', ')}`
    )
  }
  if (requireFull) {
    const missing = [...allowedKeys].filter((key) => !Object.hasOwn(data, key))
    if (missing.length) {
      throw new Error(`${path} is missing: ${missing.join(', ')}`)
    }
  }

  requireCanonicalProfileStamp(data.created, `${path}.created`, 'created')
  requireCanonicalProfileStamp(data.updated, `${path}.updated`, 'updated')

  if (collectionName === 'agents') {
    requireProfileTextFields(data, path, {
      title: 120,
      summary: 1_000,
      agent_bio: 4_000,
      agent_image: 2_048,
      agent_contact_email: 320,
      agent_contact_phone: 40,
      agent_website_url: 2_048,
      subtitle: 240,
      tagline: 240,
    })
    requireProfileListFields(data, path, {
      agent_placement_types: 20,
      agent_coverage_areas: 20,
      tags: 20,
    })
    requireStringList(data, path, 'agent_placement_types', 20, 240)
    requireStringList(data, path, 'agent_coverage_areas', 20, 240)
    requireStringList(data, path, 'tags', 20, 240)
    if (requireSafeUrls) {
      requireHttpsMapValue(data, 'agent_image', path)
      requireHttpsMapValue(data, 'agent_website_url', path)
    }
    return
  }

  if (collectionName === 'chefs') {
    requireProfileTextFields(data, path, {
      title: 120,
      summary: 1_000,
      chef_bio: 4_000,
      chef_image: 2_048,
      chef_organization_name: 160,
    })
    requireProfileListFields(data, path, {
      chef_signature_dishes: 20,
      chef_gallery: MAX_CHEF_GALLERY_ITEMS,
      kitchen_ids: 20,
    })
    requireStringList(data, path, 'chef_signature_dishes', 20, 240)
    requireStringList(data, path, 'kitchen_ids', 20, 1_500)
    requireChefGallery(data, path, requireSafeUrls)
    if (requireSafeUrls) requireHttpsMapValue(data, 'chef_image', path)
    return
  }

  requireProfileTextFields(data, path, {
    title: 120,
    subtitle: 240,
    tagline: 240,
    summary: 1_000,
    bio: 4_000,
    image: 2_048,
  })
  requireProfileListFields(data, path, {
    positions: 20,
    tags: 20,
    relevant_experience: 12,
    other_experience: 12,
    languages: 12,
    certifications: 8,
    education: 8,
    volunteering: 8,
    projects: 8,
  })
  requireStringList(data, path, 'positions', 20, 240)
  requireStringList(data, path, 'tags', 20, 240)
  if (requireSafeUrls) requireHttpsMapValue(data, 'image', path)
  if (!options.allowLegacyExperience) {
    requireProfessionalItemList(
      data,
      path,
      'relevant_experience',
      12,
      requireExperienceItem
    )
    requireProfessionalItemList(
      data,
      path,
      'other_experience',
      12,
      requireExperienceItem
    )
  }
  requireProfessionalItemList(data, path, 'languages', 12, requireLanguageItem)
  requireProfessionalItemList(
    data,
    path,
    'certifications',
    8,
    (value, itemPath) =>
      requireCertificationItem(value, itemPath, requireSafeUrls)
  )
  requireProfessionalItemList(data, path, 'education', 8, (value, itemPath) =>
    requireEducationItem(value, itemPath, requireSafeUrls)
  )
  requireProfessionalItemList(
    data,
    path,
    'volunteering',
    8,
    (value, itemPath) => requireActivityItem(value, itemPath, 'organization')
  )
  requireProfessionalItemList(data, path, 'projects', 8, (value, itemPath) =>
    requireActivityItem(value, itemPath, 'name')
  )
  const structuredItemCount = [
    'relevant_experience',
    'other_experience',
    'languages',
    'certifications',
    'education',
    'volunteering',
    'projects',
  ].reduce(
    (count, field) =>
      count + (Array.isArray(data[field]) ? data[field].length : 0),
    0
  )
  if (structuredItemCount > 24) {
    throw new Error(`${path} exceeds the 24-item structured profile limit.`)
  }
}

function canonicalExperienceString(value) {
  return typeof value === 'string' ? value : ''
}

function inferExperienceCollection(state, placeId, path) {
  const candidates = [
    state.rootKitchens.has(placeId) ? 'kitchens' : '',
    state.rootCompanies.has(placeId) ? 'companies' : '',
  ].filter(Boolean)
  if (candidates.length > 1) {
    throw new Error(`${path}.place_id resolves to multiple root collections.`)
  }
  return candidates[0] || ''
}

function normalizeExperienceList(value, state, path) {
  if (!Array.isArray(value)) return { value, itemsNormalized: 0 }
  let itemsNormalized = 0
  const normalized = value.map((entry, index) => {
    const itemPath = `${path}[${index}]`
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`${itemPath} must be a map.`)
    }
    const placeId = canonicalExperienceString(entry.place_id)
    const placeCollection =
      typeof entry.place_collection === 'string'
        ? entry.place_collection
        : inferExperienceCollection(state, placeId, itemPath)
    const next = {
      role: canonicalExperienceString(entry.role),
      from_month: canonicalExperienceString(entry.from_month),
      from_year: canonicalExperienceString(entry.from_year),
      to_month: canonicalExperienceString(entry.to_month),
      to_year: canonicalExperienceString(entry.to_year),
      ongoing: entry.ongoing === true,
      responsibilities: canonicalExperienceString(entry.responsibilities),
      place_id: placeId,
      place_collection: placeCollection,
    }
    if (!sameValue(entry, next)) itemsNormalized += 1
    return next
  })
  return { value: normalized, itemsNormalized }
}

function requireProfessionalPlaces(state, data, path) {
  for (const field of ['relevant_experience', 'other_experience']) {
    for (const [index, item] of (data[field] || []).entries()) {
      const placeId = text(item?.place_id)
      if (!placeId || !state.rootPlaces.has(placeId)) {
        throw new Error(
          `${path}.${field}[${index}].place_id does not resolve to places/${placeId || '<empty>'}.`
        )
      }
    }
  }
}

function buildCanonicalProfilePlan(state) {
  assertBoundaryMarker(state.migrationMarker)
  const patches = []
  const collectionUpdates = {
    agents: 0,
    chefs: 0,
    professionals: 0,
  }
  let fieldsBackfilled = 0
  let experienceItemsNormalized = 0

  for (const [collectionName, rows] of Object.entries(state.rootProfiles)) {
    const defaultsFactory = ROOT_PROFILE_DEFAULTS[collectionName]
    const allowedKeys = ROOT_PROFILE_KEYS[collectionName]
    if (!defaultsFactory || !allowedKeys) {
      throw new Error(`Unsupported root profile collection: ${collectionName}`)
    }
    assertExactKeySet(
      new Set([...Object.keys(defaultsFactory()), 'created', 'updated']),
      allowedKeys,
      `${collectionName} defaults`
    )

    for (const [id, row] of rows) {
      requireCanonicalUser(state, id)
      requireCanonicalProfileData(collectionName, row.data, row.path, false, {
        allowLegacyExperience: collectionName === 'professionals',
      })

      const patch = {}
      const defaults = defaultsFactory()
      const missingFields = []
      for (const [key, value] of Object.entries(defaults)) {
        if (!Object.hasOwn(row.data, key)) {
          patch[key] = value
          missingFields.push(key)
        }
      }
      let normalizedExperienceItems = 0
      if (collectionName === 'professionals') {
        for (const field of ['relevant_experience', 'other_experience']) {
          if (!Object.hasOwn(row.data, field)) continue
          const normalized = normalizeExperienceList(
            row.data[field],
            state,
            `${row.path}.${field}`
          )
          normalizedExperienceItems += normalized.itemsNormalized
          if (!sameValue(row.data[field], normalized.value)) {
            patch[field] = normalized.value
          }
        }
      }
      if (!Object.keys(patch).length) continue

      patch.updated = {
        at: Timestamp.now(),
        by: 'system:profile-canonical-shape-v1',
      }
      requireCanonicalProfileData(
        collectionName,
        { ...row.data, ...patch },
        row.path,
        true
      )
      fieldsBackfilled += missingFields.length
      experienceItemsNormalized += normalizedExperienceItems
      collectionUpdates[collectionName] += 1
      patches.push({
        ...row,
        patch,
        missingFields: missingFields.sort(),
        normalizedExperienceItems,
      })
    }
  }

  if (
    patches.length !== PROFILE_SHAPE_COUNTS.documentsUpdated ||
    fieldsBackfilled !== PROFILE_SHAPE_COUNTS.fieldsBackfilled ||
    collectionUpdates.agents !== PROFILE_SHAPE_COUNTS.agentsUpdated ||
    collectionUpdates.chefs !== PROFILE_SHAPE_COUNTS.chefsUpdated ||
    collectionUpdates.professionals !==
      PROFILE_SHAPE_COUNTS.professionalsUpdated ||
    experienceItemsNormalized !== PROFILE_SHAPE_COUNTS.experienceItemsNormalized
  ) {
    throw new Error(
      'The pending canonical profile-shape delta no longer matches the audited dataset: ' +
        JSON.stringify({
          documentsUpdated: patches.length,
          fieldsBackfilled,
          agentsUpdated: collectionUpdates.agents,
          chefsUpdated: collectionUpdates.chefs,
          professionalsUpdated: collectionUpdates.professionals,
          experienceItemsNormalized,
        })
    )
  }

  return {
    patches,
    summary: {
      target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
      credentialSource: credential.source,
      documentsToUpdate: patches.length,
      fieldsBackfilled,
      experienceItemsNormalized,
      collections: {
        agents: collectionUpdates.agents,
        chefs: collectionUpdates.chefs,
        professionals: collectionUpdates.professionals,
      },
      changes: patches.map((row) => ({
        path: row.path,
        setFields: Object.keys(row.patch)
          .filter((key) => key !== 'updated')
          .sort(),
        fieldsBackfilled: row.missingFields,
        experienceItemsNormalized: row.normalizedExperienceItems,
      })),
    },
  }
}

async function writeCanonicalProfileBackup(plan, state) {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-profile-canonical-shape-${stamp}.json`
  const backup = {
    format: 'fireux-profile-canonical-shape-backup/1',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
    predecessorMarker: {
      path: MIGRATION_MARKER_PATH,
      exists: state.migrationMarker.exists,
      updateTime:
        state.migrationMarker.updateTime?.toDate?.().toISOString() || null,
      data: serialize(state.migrationMarker.data() || null),
    },
    profileShapeMarker: {
      path: PROFILE_SHAPE_MARKER_PATH,
      exists: state.profileShapeMarker.exists,
      updateTime:
        state.profileShapeMarker.updateTime?.toDate?.().toISOString() || null,
      data: serialize(state.profileShapeMarker.data() || null),
    },
    documents: plan.patches.map((row) => ({
      path: row.path,
      exists: true,
      updateTime: row.updateTime?.toDate?.().toISOString() || null,
      data: serialize(row.data),
    })),
  }
  const encoded = `${JSON.stringify(backup, null, 2)}\n`
  const sha256 = createHash('sha256').update(encoded).digest('hex')
  await writeFile(path, encoded, { flag: 'wx', mode: 0o600 })
  return { path, sha256 }
}

function assertTransactionCollectionMatches(snapshot, expectedRows, path) {
  if (snapshot.size !== expectedRows.size) {
    throw new Error(`${path} collection membership changed after planning.`)
  }
  const currentByPath = new Map(
    snapshot.docs.map((document) => [document.ref.path, document])
  )
  for (const row of expectedRows.values()) {
    const current = currentByPath.get(row.path)
    if (
      !current?.exists ||
      !sameValue(current.updateTime, row.updateTime) ||
      !sameValue(current.data(), row.data)
    ) {
      throw new Error(`${row.path} changed after planning.`)
    }
  }
  return currentByPath
}

async function applyCanonicalProfilePlan(plan, backupSha256, state) {
  const predecessorSourceBackupSha256 = assertBoundaryMarker(
    state.migrationMarker
  )
  if (state.profileShapeMarker.exists) {
    throw new Error(`${PROFILE_SHAPE_MARKER_PATH} already exists.`)
  }

  const boundaryRef = db.doc(MIGRATION_MARKER_PATH)
  const profileShapeRef = db.doc(PROFILE_SHAPE_MARKER_PATH)
  await db.runTransaction(async (transaction) => {
    const [currentBoundary, currentProfileShape] = await transaction.getAll(
      boundaryRef,
      profileShapeRef
    )
    const [currentUsers, currentAgents, currentChefs, currentProfessionals] =
      await Promise.all([
        transaction.get(db.collection('users')),
        transaction.get(db.collection('agents')),
        transaction.get(db.collection('chefs')),
        transaction.get(db.collection('professionals')),
      ])
    assertBoundaryMarker(currentBoundary)
    if (
      !sameValue(
        currentBoundary.updateTime,
        state.migrationMarker.updateTime
      ) ||
      !sameValue(currentBoundary.data(), state.migrationMarker.data())
    ) {
      throw new Error(`${MIGRATION_MARKER_PATH} changed after planning.`)
    }
    if (currentProfileShape.exists) {
      throw new Error(`${PROFILE_SHAPE_MARKER_PATH} already exists.`)
    }

    assertTransactionCollectionMatches(currentUsers, state.users, 'users')
    const currentProfiles = new Map([
      ...assertTransactionCollectionMatches(
        currentAgents,
        state.rootProfiles.agents,
        'agents'
      ),
      ...assertTransactionCollectionMatches(
        currentChefs,
        state.rootProfiles.chefs,
        'chefs'
      ),
      ...assertTransactionCollectionMatches(
        currentProfessionals,
        state.rootProfiles.professionals,
        'professionals'
      ),
    ])

    for (const row of plan.patches) {
      const current = currentProfiles.get(row.path)
      if (
        !current?.exists ||
        !sameValue(current.updateTime, row.updateTime) ||
        !sameValue(current.data(), row.data)
      ) {
        throw new Error(`${row.path} changed after planning.`)
      }
      transaction.update(row.ref, row.patch, {
        lastUpdateTime: row.updateTime,
      })
    }
    transaction.create(profileShapeRef, {
      schema_version: 1,
      complete: true,
      no_legacy_compatibility: true,
      completed_at: FieldValue.serverTimestamp(),
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      app_id: APP_ID,
      source_backup_sha256: backupSha256,
      predecessor_marker_path: MIGRATION_MARKER_PATH,
      predecessor_source_backup_sha256: predecessorSourceBackupSha256,
      documents_updated: PROFILE_SHAPE_COUNTS.documentsUpdated,
      fields_backfilled: PROFILE_SHAPE_COUNTS.fieldsBackfilled,
      agent_documents_updated: PROFILE_SHAPE_COUNTS.agentsUpdated,
      chef_documents_updated: PROFILE_SHAPE_COUNTS.chefsUpdated,
      professional_documents_updated: PROFILE_SHAPE_COUNTS.professionalsUpdated,
      experience_items_normalized:
        PROFILE_SHAPE_COUNTS.experienceItemsNormalized,
    })
  })
}

async function verifyCanonicalProfileCompletion(
  boundaryMarker,
  profileShapeMarker,
  expectedBackupSha256 = ''
) {
  let currentBoundaryMarker = boundaryMarker
  let currentProfileShapeMarker = profileShapeMarker
  if (!currentBoundaryMarker?.exists || !currentProfileShapeMarker?.exists) {
    const resolvedMarkers = await Promise.all([
      db.doc(MIGRATION_MARKER_PATH).get(),
      db.doc(PROFILE_SHAPE_MARKER_PATH).get(),
    ])
    currentBoundaryMarker = resolvedMarkers[0]
    currentProfileShapeMarker = resolvedMarkers[1]
  }

  const predecessorSourceBackupSha256 = assertBoundaryMarker(
    currentBoundaryMarker
  )
  const boundaryVerification = await verifyExistingMarker(currentBoundaryMarker)
  const sourceBackupSha256 = currentProfileShapeMarker?.get?.(
    'source_backup_sha256'
  )
  const profileShapeMarkerKeys = new Set(
    Object.keys(currentProfileShapeMarker?.data?.() || {})
  )
  if (
    !currentProfileShapeMarker?.exists ||
    !sameValue(
      [...profileShapeMarkerKeys].sort(),
      [...PROFILE_SHAPE_MARKER_KEYS].sort()
    ) ||
    currentProfileShapeMarker.get('schema_version') !== 1 ||
    currentProfileShapeMarker.get('complete') !== true ||
    currentProfileShapeMarker.get('no_legacy_compatibility') !== true ||
    currentProfileShapeMarker.get('project_id') !== PROJECT_ID ||
    currentProfileShapeMarker.get('database_id') !== DATABASE_ID ||
    currentProfileShapeMarker.get('app_id') !== APP_ID ||
    typeof currentProfileShapeMarker.get('completed_at')?.toMillis !==
      'function' ||
    !/^[a-f0-9]{64}$/.test(String(sourceBackupSha256 || '')) ||
    (expectedBackupSha256 && sourceBackupSha256 !== expectedBackupSha256) ||
    currentProfileShapeMarker.get('predecessor_marker_path') !==
      MIGRATION_MARKER_PATH ||
    currentProfileShapeMarker.get('predecessor_source_backup_sha256') !==
      predecessorSourceBackupSha256 ||
    currentProfileShapeMarker.get('documents_updated') !==
      PROFILE_SHAPE_COUNTS.documentsUpdated ||
    currentProfileShapeMarker.get('fields_backfilled') !==
      PROFILE_SHAPE_COUNTS.fieldsBackfilled ||
    currentProfileShapeMarker.get('agent_documents_updated') !==
      PROFILE_SHAPE_COUNTS.agentsUpdated ||
    currentProfileShapeMarker.get('chef_documents_updated') !==
      PROFILE_SHAPE_COUNTS.chefsUpdated ||
    currentProfileShapeMarker.get('professional_documents_updated') !==
      PROFILE_SHAPE_COUNTS.professionalsUpdated ||
    currentProfileShapeMarker.get('experience_items_normalized') !==
      PROFILE_SHAPE_COUNTS.experienceItemsNormalized
  ) {
    throw new Error(`${PROFILE_SHAPE_MARKER_PATH} is missing or stale.`)
  }

  return {
    ...boundaryVerification,
    canonicalProfileShapeMarker: PROFILE_SHAPE_MARKER_PATH,
    canonicalProfileDocumentsUpdated: PROFILE_SHAPE_COUNTS.documentsUpdated,
    canonicalProfileFieldsBackfilled: PROFILE_SHAPE_COUNTS.fieldsBackfilled,
    canonicalExperienceItemsNormalized:
      PROFILE_SHAPE_COUNTS.experienceItemsNormalized,
    canonicalProfileBackupSha256: sourceBackupSha256,
  }
}

function normalizeStoredHttps(value, path, options = {}) {
  const raw = text(value)
  if (!raw) return ''
  if (options.allowEcosystemAvatar && raw === USER_ECOSYSTEM_AVATAR_SRC) {
    return raw
  }
  if (isHttpsUrl(raw)) return raw
  if (!/^[a-z][a-z\d+.-]*:/i.test(raw)) {
    const candidate = `https://${raw}`
    if (isHttpsUrl(candidate)) return candidate
  }
  throw new Error(`${path} cannot be normalized to a trusted HTTPS URL.`)
}

function readOptionalProviderHttps(value) {
  const raw = text(value)
  return isHttpsUrl(raw, false) ? raw : ''
}

function normalizeProfileUrls(collectionName, data, path) {
  const next = { ...data }
  let normalizedCount = 0
  const normalizeField = (field) => {
    const normalized = normalizeStoredHttps(data[field], `${path}.${field}`)
    if (normalized !== data[field]) {
      next[field] = normalized
      normalizedCount += 1
    }
  }

  if (collectionName === 'agents') {
    normalizeField('agent_image')
    normalizeField('agent_website_url')
  } else if (collectionName === 'chefs') {
    normalizeField('chef_image')
    next.chef_gallery = data.chef_gallery.map((item, index) => {
      const imageUrl = normalizeStoredHttps(
        item.image_url,
        `${path}.chef_gallery[${index}].image_url`
      )
      if (imageUrl === item.image_url) return item
      normalizedCount += 1
      return { ...item, image_url: imageUrl }
    })
  } else if (collectionName === 'professionals') {
    normalizeField('image')
    for (const field of ['certifications', 'education']) {
      next[field] = data[field].map((item, index) => {
        const documentUrl = normalizeStoredHttps(
          item.document_url,
          `${path}.${field}[${index}].document_url`
        )
        const imageUrl = normalizeStoredHttps(
          item.image_url,
          `${path}.${field}[${index}].image_url`
        )
        if (documentUrl === item.document_url && imageUrl === item.image_url) {
          return item
        }
        if (documentUrl !== item.document_url) normalizedCount += 1
        if (imageUrl !== item.image_url) normalizedCount += 1
        return { ...item, document_url: documentUrl, image_url: imageUrl }
      })
    }
  }

  return { data: next, normalizedCount }
}

function collectProfessionalPlaceIds(state) {
  const ids = new Set()
  for (const row of state.rootProfiles.professionals.values()) {
    for (const field of ['relevant_experience', 'other_experience']) {
      for (const item of row.data[field]) ids.add(text(item.place_id))
    }
  }
  return [...ids].filter(Boolean).sort()
}

async function readGooglePlacesApiKey() {
  const fromEnvironment = [
    process.env.GOOGLE_PLACES_API_KEY,
    process.env.NUXT_GOOGLE_PLACES_API_KEY,
    process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  ].find((value) => text(value))
  if (fromEnvironment) return text(fromEnvironment)

  const contents = await readFile('projects/misebox/misebox-app/.env', 'utf8')
  const line = contents
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith('GOOGLE_PLACES_API_KEY='))
  const encoded = line?.slice(line.indexOf('=') + 1).trim() || ''
  const value = encoded.replace(/^(['"])(.*)\1$/, '$2').trim()
  if (!value)
    throw new Error('GOOGLE_PLACES_API_KEY is required to repair Places.')
  return value
}

function googleAddress(result) {
  const components = Array.isArray(result.address_components)
    ? result.address_components
    : []
  const component = (type, short = false) => {
    const match = components.find((entry) =>
      Array.isArray(entry?.types) ? entry.types.includes(type) : false
    )
    return text(short ? match?.short_name : match?.long_name)
  }
  const street = [component('route'), component('street_number')]
    .filter(Boolean)
    .join(' ')
  const city =
    component('locality') ||
    component('postal_town') ||
    component('administrative_area_level_2')
  const country = component('country')
  return {
    address: {
      street,
      city,
      region: component('administrative_area_level_1', true),
      postal_code: component('postal_code'),
      country_code: component('country', true).toUpperCase(),
    },
    shortAddress: [city, country].filter(Boolean).join(', '),
  }
}

function currencyCodeFromCountry(countryCode) {
  const currencies = {
    AT: 'EUR',
    AU: 'AUD',
    CA: 'CAD',
    CH: 'CHF',
    DE: 'EUR',
    ES: 'EUR',
    FR: 'EUR',
    GB: 'GBP',
    IE: 'EUR',
    IT: 'EUR',
    NL: 'EUR',
    NO: 'NOK',
    NZ: 'NZD',
    PT: 'EUR',
    US: 'USD',
  }
  return currencies[text(countryCode).toUpperCase()] || ''
}

function placeSlug(value) {
  return text(value)
    .replace(/\u00c4/g, 'Ae')
    .replace(/\u00d6/g, 'Oe')
    .replace(/\u00dc/g, 'Ue')
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
    .replace(/\u00c6/g, 'Ae')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u0152/g, 'Oe')
    .replace(/\u0153/g, 'oe')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fetchCanonicalGooglePlace(placeId, state) {
  const key = await readGooglePlacesApiKey()
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set(
    'fields',
    [
      'address_component',
      'formatted_address',
      'formatted_phone_number',
      'geometry',
      'international_phone_number',
      'name',
      'place_id',
      'price_level',
      'type',
      'url',
      'vicinity',
      'website',
    ].join(',')
  )
  url.searchParams.set('key', key)
  const response = await fetch(url)
  const payload = await response.json()
  if (!response.ok || payload?.status !== 'OK' || !payload?.result) {
    throw new Error(
      `Google Places could not resolve ${placeId} (${payload?.status || response.status}).`
    )
  }

  const result = payload.result
  if (text(result.place_id) !== placeId) {
    throw new Error(`Google Places returned the wrong id for ${placeId}.`)
  }
  const name = text(result.name)
  const formattedAddress = text(result.formatted_address || result.vicinity)
  const lat = Number(result.geometry?.location?.lat)
  const lng = Number(result.geometry?.location?.lng)
  if (
    !name ||
    !formattedAddress ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    (lat === 0 && lng === 0)
  ) {
    throw new Error(`Google Places returned incomplete data for ${placeId}.`)
  }
  const { address, shortAddress } = googleAddress(result)
  const defaultCurrencyCode = currencyCodeFromCountry(address.country_code)
  if (!defaultCurrencyCode) {
    throw new Error(
      `Google Places returned unsupported country ${address.country_code || '(empty)'} for ${placeId}.`
    )
  }
  const entityFamilies = [
    state.rootKitchens.has(placeId) ? 'kitchen' : '',
    state.rootCompanies.has(placeId) ? 'company' : '',
  ].filter(Boolean)
  const now = Timestamp.now()
  return {
    name,
    short_name: '',
    brand_tagline: '',
    about: '',
    formatted_address: formattedAddress,
    short_address: shortAddress,
    address,
    lat,
    lng,
    timezone: '',
    image_url: '',
    cover_image: '',
    gallery_images: [],
    image_shade: 'none',
    phone: text(
      result.international_phone_number || result.formatted_phone_number
    ),
    email: '',
    website: readOptionalProviderHttps(result.website),
    google_maps_url: normalizeStoredHttps(
      result.url,
      `${placeId}.google_maps_url`
    ),
    social_links: {
      website: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      linkedin: '',
      youtube: '',
    },
    place_type: 'physical',
    types: Array.isArray(result.types)
      ? result.types.map(text).filter(Boolean)
      : [],
    tags: [],
    price_level:
      Number.isFinite(Number(result.price_level)) && result.price_level != null
        ? String(result.price_level)
        : '',
    default_currency_code: defaultCurrencyCode,
    claimed_by: '',
    verified: false,
    slug: placeSlug(name),
    entity_families: entityFamilies,
    source: 'fireux',
    search_term: `${name} ${formattedAddress}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim(),
    created: { at: now, by: 'system:profile-integrity-v1' },
    updated: { at: now, by: 'system:profile-integrity-v1' },
  }
}

function profileIntegrityPlacePayloadSha256(rows) {
  const payload = rows
    .map((row) => {
      if (!row?.path || !row?.data) {
        throw new Error('Complete canonical Place payloads are required.')
      }
      return {
        path: row.path,
        data: canonicalize(serialize(row.data)),
      }
    })
    .sort((left, right) => left.path.localeCompare(right.path))
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

async function buildProfileIntegrityPlan(state, options = {}) {
  assertBoundaryMarker(state.migrationMarker)
  await verifyCanonicalProfileCompletion(
    state.migrationMarker,
    state.profileShapeMarker
  )
  if (state.profileIntegrityMarker.exists) {
    throw new Error(`${PROFILE_INTEGRITY_MARKER_PATH} already exists.`)
  }

  const patches = []
  let urlsNormalized = 0
  for (const row of state.users.values()) {
    const avatar = text(row.data.avatar)
      ? normalizeStoredHttps(row.data.avatar, `${row.path}.avatar`, {
          allowEcosystemAvatar: true,
        })
      : USER_ECOSYSTEM_AVATAR_SRC
    if (avatar !== row.data.avatar) {
      urlsNormalized += 1
      patches.push({
        ...row,
        patch: {
          avatar,
          updated: { at: Timestamp.now(), by: 'system:profile-integrity-v1' },
        },
      })
    }
  }
  for (const [collectionName, rows] of Object.entries(state.rootProfiles)) {
    for (const row of rows.values()) {
      const normalized = normalizeProfileUrls(
        collectionName,
        row.data,
        row.path
      )
      if (!normalized.normalizedCount) continue
      urlsNormalized += normalized.normalizedCount
      const updated = {
        at: Timestamp.now(),
        by: 'system:profile-integrity-v1',
      }
      const next = { ...normalized.data, updated }
      requireCanonicalProfileData(collectionName, next, row.path, true, {
        requireSafeUrls: true,
      })
      const patch = { updated }
      for (const key of Object.keys(normalized.data)) {
        if (!sameValue(normalized.data[key], row.data[key])) {
          patch[key] = normalized.data[key]
        }
      }
      patches.push({ ...row, patch })
    }
  }

  const allPlaceIds = collectProfessionalPlaceIds(state)
  const missingPlaceIds = allPlaceIds.filter((id) => !state.rootPlaces.has(id))
  if (!sameValue(missingPlaceIds, PROFILE_INTEGRITY_PLACE_IDS)) {
    throw new Error(
      `The missing Professional Place set changed: ${missingPlaceIds.join(', ')}`
    )
  }
  const places = options.fetchMissingPlaces
    ? await Promise.all(
        missingPlaceIds.map(async (id) => ({
          id,
          path: `places/${id}`,
          ref: db.doc(`places/${id}`),
          data: await fetchCanonicalGooglePlace(id, state),
        }))
      )
    : missingPlaceIds.map((id) => ({
        id,
        path: `places/${id}`,
        ref: db.doc(`places/${id}`),
        data: null,
      }))

  if (
    patches.length !== PROFILE_INTEGRITY_COUNTS.documentsUpdated ||
    urlsNormalized !== PROFILE_INTEGRITY_COUNTS.urlsNormalized ||
    places.length !== PROFILE_INTEGRITY_COUNTS.placesCreated
  ) {
    throw new Error(
      `The pending profile-integrity delta changed: ${JSON.stringify({
        documentsUpdated: patches.length,
        urlsNormalized,
        placesCreated: places.length,
      })}`
    )
  }

  return {
    patches,
    places,
    summary: {
      target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
      credentialSource: credential.source,
      documentsToUpdate: patches.length,
      urlsToNormalize: urlsNormalized,
      placesToCreate: places.length,
      placeIds: missingPlaceIds,
      changes: patches.map((row) => ({
        path: row.path,
        setFields: Object.keys(row.patch).sort(),
      })),
    },
  }
}

async function writeProfileIntegrityBackup(plan, state) {
  if (plan.places.some((row) => !row.data)) {
    throw new Error('Canonical Place source data is required before backup.')
  }
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-profile-integrity-${stamp}.json`
  const backup = {
    format: 'fireux-profile-integrity-backup/1',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
    predecessorMarker: {
      path: PROFILE_SHAPE_MARKER_PATH,
      updateTime:
        state.profileShapeMarker.updateTime?.toDate?.().toISOString() || null,
      data: serialize(state.profileShapeMarker.data() || null),
    },
    integrityMarker: {
      path: PROFILE_INTEGRITY_MARKER_PATH,
      exists: state.profileIntegrityMarker.exists,
    },
    documents: [
      ...plan.patches.map((row) => ({
        path: row.path,
        exists: true,
        updateTime: row.updateTime?.toDate?.().toISOString() || null,
        data: serialize(row.data),
      })),
      ...plan.places.map((row) => ({
        path: row.path,
        exists: false,
        updateTime: null,
        data: null,
        canonicalSource: serialize(row.data),
      })),
    ],
  }
  const encoded = `${JSON.stringify(backup, null, 2)}\n`
  const sha256 = createHash('sha256').update(encoded).digest('hex')
  await writeFile(path, encoded, { flag: 'wx', mode: 0o600 })
  return { path, sha256 }
}

async function applyProfileIntegrityPlan(plan, backupSha256, state) {
  if (plan.places.some((row) => !row.data)) {
    throw new Error('Canonical Place source data is required before commit.')
  }
  const placePayloadSha256 = profileIntegrityPlacePayloadSha256(plan.places)
  const shapeSourceBackupSha256 = state.profileShapeMarker.get(
    'source_backup_sha256'
  )
  const boundaryRef = db.doc(MIGRATION_MARKER_PATH)
  const shapeRef = db.doc(PROFILE_SHAPE_MARKER_PATH)
  const integrityRef = db.doc(PROFILE_INTEGRITY_MARKER_PATH)
  await db.runTransaction(async (transaction) => {
    const [boundary, shape, integrity] = await transaction.getAll(
      boundaryRef,
      shapeRef,
      integrityRef
    )
    const [users, agents, chefs, professionals, places] = await Promise.all([
      transaction.get(db.collection('users')),
      transaction.get(db.collection('agents')),
      transaction.get(db.collection('chefs')),
      transaction.get(db.collection('professionals')),
      transaction.get(db.collection('places')),
    ])
    assertBoundaryMarker(boundary)
    if (
      !sameValue(boundary.updateTime, state.migrationMarker.updateTime) ||
      !sameValue(boundary.data(), state.migrationMarker.data()) ||
      !sameValue(shape.updateTime, state.profileShapeMarker.updateTime) ||
      !sameValue(shape.data(), state.profileShapeMarker.data())
    ) {
      throw new Error('Profile-integrity predecessor evidence changed.')
    }
    if (integrity.exists) {
      throw new Error(`${PROFILE_INTEGRITY_MARKER_PATH} already exists.`)
    }
    const current = new Map([
      ...assertTransactionCollectionMatches(users, state.users, 'users'),
      ...assertTransactionCollectionMatches(
        agents,
        state.rootProfiles.agents,
        'agents'
      ),
      ...assertTransactionCollectionMatches(
        chefs,
        state.rootProfiles.chefs,
        'chefs'
      ),
      ...assertTransactionCollectionMatches(
        professionals,
        state.rootProfiles.professionals,
        'professionals'
      ),
    ])
    assertTransactionCollectionMatches(places, state.rootPlaces, 'places')

    for (const row of plan.patches) {
      const snapshot = current.get(row.path)
      if (!snapshot?.exists || !sameValue(snapshot.data(), row.data)) {
        throw new Error(`${row.path} changed after planning.`)
      }
      transaction.update(row.ref, row.patch, {
        lastUpdateTime: row.updateTime,
      })
    }
    for (const row of plan.places) transaction.create(row.ref, row.data)
    transaction.create(integrityRef, {
      schema_version: 1,
      complete: true,
      no_legacy_compatibility: true,
      completed_at: FieldValue.serverTimestamp(),
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      app_id: APP_ID,
      source_backup_sha256: backupSha256,
      predecessor_marker_path: PROFILE_SHAPE_MARKER_PATH,
      predecessor_source_backup_sha256: shapeSourceBackupSha256,
      documents_updated: PROFILE_INTEGRITY_COUNTS.documentsUpdated,
      urls_normalized: PROFILE_INTEGRITY_COUNTS.urlsNormalized,
      places_created: PROFILE_INTEGRITY_COUNTS.placesCreated,
      place_ids: [...PROFILE_INTEGRITY_PLACE_IDS],
      place_payload_sha256: placePayloadSha256,
    })
  })
}

async function verifyProfileIntegrityCompletion(
  boundaryMarker,
  profileShapeMarker,
  profileIntegrityMarker,
  expectedBackupSha256 = ''
) {
  const shapeVerification = await verifyCanonicalProfileCompletion(
    boundaryMarker,
    profileShapeMarker
  )
  let marker = profileIntegrityMarker
  if (!marker?.exists) {
    marker = await db.doc(PROFILE_INTEGRITY_MARKER_PATH).get()
  }
  const keys = new Set(Object.keys(marker?.data?.() || {}))
  const sourceBackupSha256 = marker?.get?.('source_backup_sha256')
  const placePayloadSha256 = marker?.get?.('place_payload_sha256')
  if (
    !marker?.exists ||
    !sameValue([...keys].sort(), [...PROFILE_INTEGRITY_MARKER_KEYS].sort()) ||
    marker.get('schema_version') !== 1 ||
    marker.get('complete') !== true ||
    marker.get('no_legacy_compatibility') !== true ||
    typeof marker.get('completed_at')?.toMillis !== 'function' ||
    marker.get('project_id') !== PROJECT_ID ||
    marker.get('database_id') !== DATABASE_ID ||
    marker.get('app_id') !== APP_ID ||
    !/^[a-f0-9]{64}$/.test(String(sourceBackupSha256 || '')) ||
    (expectedBackupSha256 && sourceBackupSha256 !== expectedBackupSha256) ||
    marker.get('predecessor_marker_path') !== PROFILE_SHAPE_MARKER_PATH ||
    marker.get('predecessor_source_backup_sha256') !==
      profileShapeMarker.get('source_backup_sha256') ||
    marker.get('documents_updated') !==
      PROFILE_INTEGRITY_COUNTS.documentsUpdated ||
    marker.get('urls_normalized') !== PROFILE_INTEGRITY_COUNTS.urlsNormalized ||
    marker.get('places_created') !== PROFILE_INTEGRITY_COUNTS.placesCreated ||
    !sameValue(marker.get('place_ids'), PROFILE_INTEGRITY_PLACE_IDS) ||
    !/^[a-f0-9]{64}$/.test(String(placePayloadSha256 || ''))
  ) {
    throw new Error(`${PROFILE_INTEGRITY_MARKER_PATH} is missing or stale.`)
  }

  const integrityVerification = await verifyExistingMarker(boundaryMarker, {
    requireProfileIntegrity: true,
  })
  const placeSnapshots = await db.getAll(
    ...PROFILE_INTEGRITY_PLACE_IDS.map((id) => db.doc(`places/${id}`))
  )
  for (const snapshot of placeSnapshots) {
    const data = snapshot.data() || {}
    if (
      !snapshot.exists ||
      Object.hasOwn(data, 'id') ||
      !text(data.name) ||
      !text(data.formatted_address) ||
      !Number.isFinite(Number(data.lat)) ||
      !Number.isFinite(Number(data.lng)) ||
      (Number(data.lat) === 0 && Number(data.lng) === 0) ||
      !text(data.default_currency_code)
    ) {
      throw new Error(`${snapshot.ref.path} is not a materialized Place.`)
    }
  }
  const currentPlacePayloadSha256 = profileIntegrityPlacePayloadSha256(
    placeSnapshots.map((snapshot) => ({
      path: snapshot.ref.path,
      data: snapshot.data(),
    }))
  )
  if (
    expectedBackupSha256 &&
    currentPlacePayloadSha256 !== placePayloadSha256
  ) {
    throw new Error(
      `${PROFILE_INTEGRITY_MARKER_PATH} Place payload evidence is stale.`
    )
  }
  return {
    ...integrityVerification,
    ...shapeVerification,
    profileIntegrityMarker: PROFILE_INTEGRITY_MARKER_PATH,
    profileIntegrityDocumentsUpdated: PROFILE_INTEGRITY_COUNTS.documentsUpdated,
    profileIntegrityUrlsNormalized: PROFILE_INTEGRITY_COUNTS.urlsNormalized,
    profileIntegrityPlacesCreated: PROFILE_INTEGRITY_COUNTS.placesCreated,
    profileIntegrityBackupSha256: sourceBackupSha256,
    profileIntegrityPlacePayloadSha256: placePayloadSha256,
    profileIntegrityPlacePayloadMatches:
      currentPlacePayloadSha256 === placePayloadSha256,
  }
}

async function writeBackup(plan, state, historical) {
  const stamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  const path = `/private/tmp/fireux-misebox-user-security-${stamp}.json`
  const backup = {
    format: 'fireux-user-security-backup/2',
    createdAt: new Date().toISOString(),
    target: { projectId: PROJECT_ID, databaseId: DATABASE_ID, appId: APP_ID },
    historicalSource: {
      format: historical.format,
      sha256: historical.sha256,
    },
    documents: [
      ...plan.patches.map((row) => ({
        path: row.path,
        exists: true,
        updateTime: row.updateTime?.toDate?.().toISOString() || null,
        data: serialize(row.data),
      })),
      ...plan.notifications.map((row) => ({
        path: row.path,
        exists: Boolean(row.current),
        updateTime: row.current?.updateTime?.toDate?.().toISOString() || null,
        data: serialize(row.current?.data || null),
      })),
    ],
    migrationMarker: {
      path: MIGRATION_MARKER_PATH,
      exists: state.migrationMarker.exists,
      updateTime:
        state.migrationMarker.updateTime?.toDate?.().toISOString() || null,
      data: serialize(state.migrationMarker.data() || null),
    },
  }
  const encoded = `${JSON.stringify(backup, null, 2)}\n`
  const sha256 = createHash('sha256').update(encoded).digest('hex')
  await writeFile(path, encoded, {
    flag: 'wx',
    mode: 0o600,
  })
  return { path, sha256 }
}

async function applyPlan(plan, backupSha256, historicalBackupSha256) {
  const batch = db.batch()
  for (const row of plan.patches) {
    if (row.operation === 'create') batch.create(row.ref, row.patch)
    else batch.update(row.ref, row.patch, { lastUpdateTime: row.updateTime })
  }
  for (const row of plan.notifications) {
    if (!row.current) batch.create(row.ref, row.data)
  }
  batch.create(db.doc(MIGRATION_MARKER_PATH), {
    schema_version: 4,
    complete: true,
    no_legacy_compatibility: true,
    completed_at: FieldValue.serverTimestamp(),
    source_backup_sha256: backupSha256,
    historical_source_backup_sha256: historicalBackupSha256,
    app_id: APP_ID,
    user_count: CUTOVER_COUNTS.users,
    app_user_count: CUTOVER_COUNTS.appUsers,
    root_profile_count: CUTOVER_COUNTS.rootProfiles,
    documents_updated: plan.summary.documentsToUpdate,
    obsolete_fields_removed: plan.summary.obsoleteFieldsToDelete,
    embedded_notifications_deleted: plan.summary.embeddedNotificationsToDelete,
    canonical_notifications_migrated: plan.notifications.length,
    historical_notifications_examined:
      plan.summary.historicalNotificationsExamined,
    historical_notifications_recovered:
      plan.summary.historicalNotificationsRecovered,
    notification_paths: plan.notifications.map((row) => row.path).sort(),
    notification_payload_sha256: plan.summary.notificationPayloadSha256,
    historical_bios_examined: plan.summary.historicalBiosExamined,
    historical_bios_applied: plan.summary.historicalBiosApplied,
    historical_bios_current_canonical_retained:
      plan.summary.historicalBiosCurrentCanonicalRetained,
    historical_bio_reconciliation_sha256:
      plan.summary.historicalBioReconciliationSha256,
    historical_bio_decisions: plan.historicalBios.records,
    embedded_user_snapshots_deleted: plan.summary.embeddedUserSnapshotsToDelete,
    chef_gallery_entries_migrated: plan.summary.chefGalleryEntriesMigrated,
    chef_kitchen_ids_migrated: plan.summary.chefKitchenIdsMigrated,
    dangling_chef_kitchen_snapshots_deleted:
      plan.summary.danglingChefKitchenSnapshots,
  })
  await batch.commit()
}

async function verify(
  backupSha256,
  summary,
  notificationPaths,
  historicalBioDecisions,
  options = {}
) {
  const state = await readState()
  const migrationMarker = state.migrationMarker
  const failures = []
  for (const row of state.users.values()) {
    const unknown = Object.keys(row.data).filter((key) => !USER_KEYS.has(key))
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    const id = row.path.split('/').at(-1)
    const expectedProfiles = [
      state.rootProfiles.agents.has(id) ? 'agent' : '',
      state.rootProfiles.chefs.has(id) ? 'chef' : '',
      state.rootDrivers.has(id) ? 'driver' : '',
      state.rootProfiles.professionals.has(id) ? 'professional' : '',
    ].filter(Boolean)
    if (!sameValue(row.data.profiles, expectedProfiles)) {
      failures.push(`${row.path}.profiles is not canonical`)
    }
    if (
      options.requireProfileIntegrity &&
      row.data.avatar !== USER_ECOSYSTEM_AVATAR_SRC &&
      !isHttpsUrl(row.data.avatar, false)
    ) {
      failures.push(`${row.path}.avatar is not a canonical public avatar`)
    }
  }
  for (const row of state.appUsers.values()) {
    const unknown = Object.keys(row.data).filter(
      (key) => !APP_USER_KEYS.has(key)
    )
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    if ('notifications' in row.data) {
      failures.push(`${row.path} still embeds notifications`)
    }
    const id = row.path.split('/').at(-1)
    const expectedProfiles = [
      state.appProfiles.agents.has(id) ? 'agent' : '',
      state.appProfiles.chefs.has(id) ? 'chef' : '',
      state.appCustomers.has(id) ? 'customer' : '',
      state.appDrivers.has(id) ? 'driver' : '',
      state.appProfiles.professionals.has(id) ? 'professional' : '',
    ].filter(Boolean)
    if (!sameValue(row.data.profiles, expectedProfiles)) {
      failures.push(`${row.path}.profiles is not canonical`)
    }
    try {
      const normalizedTargets = normalizeConsoleTargets(
        row.data.console_targets
      )
      if (!sameValue(row.data.console_targets, normalizedTargets)) {
        failures.push(`${row.path}.console_targets is not canonical`)
      }
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error))
    }
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
    const unknown = Object.keys(row.data).filter(
      (key) => !APP_DRIVER_KEYS.has(key)
    )
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
  }
  for (const row of state.appCustomers.values()) {
    const unknown = Object.keys(row.data).filter(
      (key) => !CUSTOMER_KEYS.has(key)
    )
    if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    if ('user' in row.data) failures.push(`${row.path} still embeds user`)
  }
  const rootProfileRows = [
    ...state.rootDrivers.entries(),
    ...Object.values(state.rootProfiles).flatMap((rows) => [...rows.entries()]),
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
      const unknown = Object.keys(row.data).filter(
        (key) => !PROFILE_OVERLAY_KEYS.has(key)
      )
      if (unknown.length) failures.push(`${row.path}: ${unknown.join(', ')}`)
    }
  }
  for (const [collectionName, rows] of Object.entries(state.rootProfiles)) {
    for (const row of rows.values()) {
      try {
        requireCanonicalProfileData(
          collectionName,
          row.data,
          row.path,
          state.profileShapeMarker.exists,
          {
            allowLegacyExperience: !state.profileShapeMarker.exists,
            requireSafeUrls: options.requireProfileIntegrity,
          }
        )
        if (
          options.requireProfileIntegrity &&
          collectionName === 'professionals'
        ) {
          requireProfessionalPlaces(state, row.data, row.path)
        }
      } catch (error) {
        failures.push(error instanceof Error ? error.message : String(error))
      }
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
  const canonicalNotificationRows = notificationPaths.map((path) =>
    state.userNotifications.get(path)
  )
  const canonicalNotificationDigest = notificationPayloadSha256(
    canonicalNotificationRows
      .filter(Boolean)
      .map((row) => ({ path: row.path, data: row.data }))
  )
  if (options.verifyNotificationPayload) {
    if (canonicalNotificationRows.some((row) => !row)) {
      failures.push(
        'one or more canonical notification destinations are missing'
      )
    } else if (
      canonicalNotificationDigest !== summary.notificationPayloadSha256
    ) {
      failures.push('canonical notification payload digest does not match')
    }
  }
  if (options.verifyHistoricalBioState) {
    for (const decision of historicalBioDecisions) {
      const destinationId = text(decision?.destination_path).match(
        /^professionals\/([^/]+)$/
      )?.[1]
      const professional = destinationId
        ? state.rootProfiles.professionals.get(destinationId)
        : null
      if (
        !professional ||
        sha256Text(text(professional.data.bio)) !== decision.canonical_sha256
      ) {
        failures.push(
          `${decision?.destination_path || 'historical bio destination'} was not reconciled`
        )
      }
    }
  }
  const historicalBioReconciliationSha256 = historicalBioDecisionSha256(
    historicalBioDecisions
  )
  if (
    !migrationMarker.exists ||
    migrationMarker.get('schema_version') !== 4 ||
    migrationMarker.get('complete') !== true ||
    migrationMarker.get('no_legacy_compatibility') !== true ||
    migrationMarker.get('source_backup_sha256') !== backupSha256 ||
    migrationMarker.get('historical_source_backup_sha256') !==
      HISTORICAL_BACKUP_SHA256 ||
    migrationMarker.get('app_id') !== APP_ID ||
    migrationMarker.get('user_count') !== CUTOVER_COUNTS.users ||
    migrationMarker.get('app_user_count') !== CUTOVER_COUNTS.appUsers ||
    migrationMarker.get('root_profile_count') !== CUTOVER_COUNTS.rootProfiles ||
    migrationMarker.get('documents_updated') !== summary.documentsToUpdate ||
    migrationMarker.get('obsolete_fields_removed') !==
      summary.obsoleteFieldsToDelete ||
    migrationMarker.get('embedded_notifications_deleted') !==
      summary.embeddedNotificationsToDelete ||
    migrationMarker.get('canonical_notifications_migrated') !==
      notificationPaths.length ||
    migrationMarker.get('historical_notifications_examined') !==
      summary.historicalNotificationsExamined ||
    migrationMarker.get('historical_notifications_recovered') !==
      summary.historicalNotificationsRecovered ||
    !sameValue(
      migrationMarker.get('notification_paths'),
      [...notificationPaths].sort()
    ) ||
    migrationMarker.get('notification_payload_sha256') !==
      summary.notificationPayloadSha256 ||
    migrationMarker.get('historical_bios_examined') !==
      summary.historicalBiosExamined ||
    migrationMarker.get('historical_bios_applied') !==
      summary.historicalBiosApplied ||
    migrationMarker.get('historical_bios_current_canonical_retained') !==
      summary.historicalBiosCurrentCanonicalRetained ||
    migrationMarker.get('historical_bio_reconciliation_sha256') !==
      summary.historicalBioReconciliationSha256 ||
    historicalBioReconciliationSha256 !==
      summary.historicalBioReconciliationSha256 ||
    !sameValue(
      migrationMarker.get('historical_bio_decisions'),
      historicalBioDecisions
    ) ||
    migrationMarker.get('embedded_user_snapshots_deleted') !==
      summary.embeddedUserSnapshotsToDelete ||
    migrationMarker.get('chef_gallery_entries_migrated') !==
      summary.chefGalleryEntriesMigrated ||
    migrationMarker.get('chef_kitchen_ids_migrated') !==
      summary.chefKitchenIdsMigrated ||
    migrationMarker.get('dangling_chef_kitchen_snapshots_deleted') !==
      summary.danglingChefKitchenSnapshots
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

async function verifyExistingMarker(marker, options = {}) {
  const notificationPaths = Array.isArray(marker.get('notification_paths'))
    ? marker.get('notification_paths')
    : []
  return verify(
    marker.get('source_backup_sha256'),
    {
      documentsToUpdate: marker.get('documents_updated'),
      obsoleteFieldsToDelete: marker.get('obsolete_fields_removed'),
      embeddedNotificationsToDelete: marker.get(
        'embedded_notifications_deleted'
      ),
      historicalNotificationsExamined: marker.get(
        'historical_notifications_examined'
      ),
      historicalNotificationsRecovered: marker.get(
        'historical_notifications_recovered'
      ),
      historicalBiosExamined: marker.get('historical_bios_examined'),
      historicalBiosApplied: marker.get('historical_bios_applied'),
      historicalBiosCurrentCanonicalRetained: marker.get(
        'historical_bios_current_canonical_retained'
      ),
      historicalBioReconciliationSha256: marker.get(
        'historical_bio_reconciliation_sha256'
      ),
      embeddedUserSnapshotsToDelete: marker.get(
        'embedded_user_snapshots_deleted'
      ),
      chefGalleryEntriesMigrated: marker.get('chef_gallery_entries_migrated'),
      chefKitchenIdsMigrated: marker.get('chef_kitchen_ids_migrated'),
      danglingChefKitchenSnapshots: marker.get(
        'dangling_chef_kitchen_snapshots_deleted'
      ),
      notificationPayloadSha256: marker.get('notification_payload_sha256'),
    },
    notificationPaths,
    Array.isArray(marker.get('historical_bio_decisions'))
      ? marker.get('historical_bio_decisions')
      : [],
    options
  )
}

function sameValue(left, right) {
  return (
    JSON.stringify(canonicalize(serialize(left))) ===
    JSON.stringify(canonicalize(serialize(right)))
  )
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])])
  )
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
