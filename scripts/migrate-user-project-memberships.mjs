#!/usr/bin/env node
/*
  Backfill core user project memberships from root /projects docs.

  What it does:
  - scans root projects
  - derives canonical project ids from:
      doc.id -> slug -> app_id -> firebase_project_id
  - assigns project ids to users when:
      project.team_ids contains the user uid
      or project.owner_user_id matches the user uid
  - merges the result into:
      users/<uid>.projects

  Usage:
    node scripts/migrate-user-project-memberships.mjs
    node scripts/migrate-user-project-memberships.mjs --uid <uid>
    node scripts/migrate-user-project-memberships.mjs --commit
    node scripts/migrate-user-project-memberships.mjs --uid <uid> --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SERVICE_ACCOUNT =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'fireux'
const MIGRATION_ACTOR = 'system:migrate-user-project-memberships'

function normalizeString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
  if (value == null) return fallback
  return String(value).trim()
}

function asStringArray(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
}

function uniqueSorted(values) {
  return [...new Set(values.map((value) => normalizeString(value)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
}

function resolveProjectId(docId, data = {}) {
  return normalizeString(
    docId ||
      data.id ||
      data.slug ||
      data.app_id ||
      data.firebase_project_id
  )
}

async function loadServiceAccount(pathLike) {
  const resolvedPath = resolve(REPO_ROOT, pathLike)
  const raw = await readFile(resolvedPath, 'utf8')
  const parsed = JSON.parse(raw)

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return {
    resolvedPath,
    projectId: normalizeString(parsed.project_id),
    credential: cert(parsed),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const help = Boolean(args.help || args.h)
  const commit = Boolean(args.commit)
  const uidFilter = normalizeString(args.uid)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? args['service-account']
      : DEFAULT_SERVICE_ACCOUNT
  const databaseId =
    typeof args.database === 'string'
      ? normalizeString(args.database)
      : DEFAULT_DATABASE_ID

  if (help) {
    console.log('\nUser project membership backfill\n')
    console.log('Optional:')
    console.log('  --service-account <path>')
    console.log('  --database <databaseId>')
    console.log('  --uid <uid>')
    console.log('  --commit')
    process.exit(0)
  }

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const app = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId: serviceAccount.projectId,
    },
    `user-project-memberships-${Date.now()}`
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)

  const projectSnap = await db.collection('projects').get()
  const projectIdsByUserId = new Map()

  for (const docSnap of projectSnap.docs) {
    const data = docSnap.data() || {}
    const projectId = resolveProjectId(docSnap.id, data)
    if (!projectId) continue

    const ownerUserId = normalizeString(data.owner_user_id)
    const teamIds = asStringArray(data.team_ids)
    const memberIds = uniqueSorted([...teamIds, ownerUserId])

    for (const uid of memberIds) {
      if (uidFilter && uid !== uidFilter) continue

      const existing = projectIdsByUserId.get(uid) || []
      existing.push(projectId)
      projectIdsByUserId.set(uid, existing)
    }
  }

  const targetUserIds = uidFilter
    ? [uidFilter]
    : [...projectIdsByUserId.keys()].sort((a, b) => a.localeCompare(b))

  console.log('[migrate] user-project-memberships start', {
    firebaseProjectId: serviceAccount.projectId,
    databaseId: databaseId || '(default)',
    commit,
    uidFilter: uidFilter || null,
    users: targetUserIds.length,
    scannedProjects: projectSnap.size,
  })

  let touchedUsers = 0
  let updatedUsers = 0

  for (const uid of targetUserIds) {
    const userRef = db.collection('users').doc(uid)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      console.log('[skip] missing user', uid)
      continue
    }

    touchedUsers += 1

    const data = userSnap.data() || {}
    const currentProjects = uniqueSorted(data.projects || [])
    const nextProjects = uniqueSorted([
      ...currentProjects,
      ...(projectIdsByUserId.get(uid) || []),
    ])

    if (
      currentProjects.length === nextProjects.length &&
      currentProjects.every((value, index) => value === nextProjects[index])
    ) {
      console.log('[skip] unchanged', userRef.path, { projects: nextProjects })
      continue
    }

    updatedUsers += 1

    const patch = {
      projects: nextProjects,
      updated: {
        at: Timestamp.now(),
        by: MIGRATION_ACTOR,
      },
    }

    if (commit) {
      await userRef.set(patch, { merge: true })
      console.log('[commit]', userRef.path, patch)
    } else {
      console.log('[dry-run]', userRef.path, patch)
    }
  }

  console.log('[migrate] user-project-memberships done', {
    touchedUsers,
    updatedUsers,
    commit,
  })
}

main().catch((error) => {
  console.error('\nUser project membership migration failed:\n')
  console.error(error)
  process.exit(1)
})
