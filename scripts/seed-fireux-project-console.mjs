

#!/usr/bin/env node
/*
  Seed Daniel Watson's FireUX project console with ecosystem-level projects.

  What it does:
  - upserts root project docs in the FireUX runtime database:
      projects/fireux
      projects/misebox
      projects/granite
      projects/bringli
      projects/cleanbox
  - ensures matching app overlays at:
      apps/fireux-app/projects/<projectId>
  - infers the owner uid from:
      1) projects/fireux.owner_user_id
      2) users where handle == "daniel"
      3) users where display_name == "Daniel Watson"

  Usage:
    node scripts/seed-fireux-project-console.mjs
    node scripts/seed-fireux-project-console.mjs --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SERVICE_ACCOUNT_PATH = 'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const DATABASE_ID = 'fireux'
const APP_ID = 'fireux-app'

const PROJECT_SEEDS = [
  {
    id: 'fireux',
    name: 'FireUX',
    slug: 'fireux',
    description: 'Core FireUX ecosystem and Firebase project.',
    image_url: '',
    status: 'active',
    primary_project: true,
    project_type: 'ecosystem_app',
    source_url: 'https://fireux.app',
    console_endpoint_url: 'https://fireux.app/api/fireux-console',
    app_id: 'fireux-app',
    ecosystem_id: 'fireux',
    firebase_project_id: 'fireux-2005',
  },
  {
    id: 'misebox',
    name: 'Misebox',
    slug: 'misebox',
    description: 'FireUX MiseBox - Kitchen, Chef, Supplier Domain Package',
    image_url: '',
    status: 'active',
    primary_project: false,
    project_type: 'ecosystem_app',
    source_url: 'https://misebox.app',
    console_endpoint_url: 'https://misebox.app/api/fireux-console',
    app_id: 'misebox-app',
    ecosystem_id: 'misebox',
    firebase_project_id: 'misebox-78f9c',
  },
  {
    id: 'granite',
    name: 'Granite',
    slug: 'granite',
    description: 'FireUX Granite - Portfolio landlord operating system ecosystem',
    image_url: '',
    status: 'active',
    primary_project: false,
    project_type: 'ecosystem_app',
    source_url: 'https://granite-os.web.app',
    console_endpoint_url: 'https://granite-os.web.app/api/fireux-console',
    app_id: 'granite-app',
    ecosystem_id: 'granite',
    firebase_project_id: 'granite-ecosystem',
  },
  {
    id: 'bringli',
    name: 'Bringli',
    slug: 'bringli',
    description: 'FireUX Bringli - Local producer delivery marketplace ecosystem',
    image_url: '',
    status: 'active',
    primary_project: false,
    project_type: 'ecosystem_app',
    source_url: 'https://bringli.web.app',
    console_endpoint_url: 'https://bringli.web.app/api/fireux-console',
    app_id: 'bringli-app',
    ecosystem_id: 'bringli',
    firebase_project_id: 'bringli-b0517',
  },
  {
    id: 'cleanbox',
    name: 'Cleanbox',
    slug: 'cleanbox',
    description: 'FireUX CleanBox - Cleaning Services Domain Package',
    image_url: '',
    status: 'active',
    primary_project: false,
    project_type: 'ecosystem_app',
    source_url: 'https://cleanbox.web.app',
    console_endpoint_url: 'https://cleanbox.web.app/api/fireux-console',
    app_id: 'cleanbox-app',
    ecosystem_id: 'cleanbox',
    firebase_project_id: 'cleanbox-f15bc',
  },
]

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

function asTimestamp(value) {
  if (value instanceof Timestamp) return value
  if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Timestamp(value.seconds, value.nanoseconds)
  }
  if (value && typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
    return new Timestamp(value._seconds, value._nanoseconds)
  }
  return null
}

async function loadServiceAccount(pathLike) {
  const resolved = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolved, 'utf8')
  const parsed = JSON.parse(raw)
  return {
    resolvedPath: resolved,
    projectId: String(parsed.project_id),
    credential: cert(parsed),
  }
}

function toRootPayload(seed, ownerUid, existing = null) {
  const existingCreated = asTimestamp(existing?.created?.at)
  const existingUpdated = asTimestamp(existing?.updated?.at)
  const now = Timestamp.now()

  return {
    id: seed.id,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    image_url: normalizeString(existing?.image_url) || seed.image_url,
    status: seed.status,
    primary_project: seed.primary_project,
    project_type: seed.project_type,
    source_url: seed.source_url,
    console_endpoint_url: seed.console_endpoint_url,
    app_id: seed.app_id,
    ecosystem_id: seed.ecosystem_id,
    firebase_project_id: seed.firebase_project_id,
    owner_user_id: ownerUid,
    operator_ids: ownerUid ? [ownerUid] : [],
    team_ids: ownerUid ? [ownerUid] : [],
    join_requests: Array.isArray(existing?.join_requests) ? existing.join_requests : [],
    created: {
      at: existingCreated || now,
      by: normalizeString(existing?.created?.by) || ownerUid,
      app_id: normalizeString(existing?.created?.app_id) || APP_ID,
    },
    updated: {
      at: now,
      by: ownerUid,
    },
  }
}

function toOverlayPayload(ownerUid, existing = null) {
  const existingCreated = asTimestamp(existing?.created?.at)
  const now = Timestamp.now()
  const operatorIds = Array.from(
    new Set(
      [
        ...(Array.isArray(existing?.operator_ids) ? existing.operator_ids : []),
        ...(Array.isArray(existing?.team_ids) ? existing.team_ids : []),
        ...(Array.isArray(existing?.admin_ids) ? existing.admin_ids : []),
        ownerUid,
      ]
        .map((value) => normalizeString(value))
        .filter(Boolean)
    )
  )

  return {
    id: normalizeString(existing?.id),
    operator_ids: operatorIds,
    team_ids: operatorIds,
    join_requests: Array.isArray(existing?.join_requests) ? existing.join_requests : [],
    created: {
      at: existingCreated || now,
      by: normalizeString(existing?.created?.by) || ownerUid,
      app_id: normalizeString(existing?.created?.app_id) || APP_ID,
    },
    updated: {
      at: now,
      by: ownerUid,
    },
  }
}

async function resolveOwnerUid(db) {
  const fireuxProjectSnap = await db.collection('projects').doc('fireux').get()
  const fireuxOwner = normalizeString(fireuxProjectSnap.data()?.owner_user_id)
  if (fireuxOwner) return fireuxOwner

  const danielHandleSnap = await db.collection('users').where('handle', '==', 'daniel').limit(1).get()
  if (!danielHandleSnap.empty) return danielHandleSnap.docs[0].id

  const danielNameSnap = await db.collection('users').where('display_name', '==', 'Daniel Watson').limit(1).get()
  if (!danielNameSnap.empty) return danielNameSnap.docs[0].id

  throw new Error('Unable to infer Daniel owner uid from projects/fireux or users collection')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const serviceAccount = await loadServiceAccount(SERVICE_ACCOUNT_PATH)

  const app = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    `seed-fireux-project-console-${Date.now()}`
  )

  const db = getFirestore(app, DATABASE_ID)
  const ownerUid = await resolveOwnerUid(db)

  console.log('[seed] fireux project console start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId: DATABASE_ID,
    appId: APP_ID,
    ownerUid,
    commit,
    projects: PROJECT_SEEDS.map((entry) => entry.id),
  })

  for (const seed of PROJECT_SEEDS) {
    const rootRef = db.collection('projects').doc(seed.id)
    const overlayRef = db.collection('apps').doc(APP_ID).collection('projects').doc(seed.id)

    const [rootSnap, overlaySnap] = await Promise.all([rootRef.get(), overlayRef.get()])
    const rootPayload = toRootPayload(seed, ownerUid, rootSnap.exists ? rootSnap.data() || {} : null)
    const overlayPayload = toOverlayPayload(ownerUid, overlaySnap.exists ? overlaySnap.data() || {} : null)
    overlayPayload.id = seed.id

    if (!commit) {
      console.log('[dry-run] set', rootRef.path, rootPayload)
      console.log('[dry-run] set', overlayRef.path, overlayPayload)
      continue
    }

    await rootRef.set(rootPayload, { merge: true })
    await overlayRef.set(overlayPayload, { merge: true })
  }

  console.log('[seed] fireux project console done', {
    commit,
    count: PROJECT_SEEDS.length,
  })

  await app.delete()
}

await main().catch((error) => {
  console.error('\nSeed failed:')
  console.error(error)
  process.exit(1)
})
