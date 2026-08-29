#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-29
// usage_note: plan or apply one Team-to-AppUser Workspace index cutover without deleting Team records.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || '').trim()
const databaseId = String(args.database || '').trim()
const appId = String(args.app || '').trim()
const family = String(args.family || '').trim()
const requestedUser = String(args.user || '').trim()
const collection =
  family === 'kitchen' ? 'kitchens' : family === 'project' ? 'projects' : ''
const idsField = collection
const primaryField =
  family === 'kitchen' ? 'primary_kitchen' : 'primary_project'
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const strings = (value) =>
  [
    ...new Set((Array.isArray(value) ? value : []).map(text).filter(Boolean)),
  ].sort()
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function')
    return { __timestamp: value.toDate().toISOString() }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, stable(child)])
  )
}
const sha256 = (value) =>
  createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')

if (!ecosystem || !databaseId || !appId || !collection) {
  throw new Error(
    'Usage: node scripts/migrate-app-user-workspace-index.mjs --ecosystem <key> --database <id> --app <app-id> --family kitchen|project [--apply --confirm <hash> --backup /private/tmp/<file>.json]'
  )
}

const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  {
    credential: auth.credential,
    projectId: target.projectId || auth.projectId,
  },
  `workspace-index-${ecosystem}-${Date.now()}`
)

try {
  const db = getFirestore(app, databaseId)
  const entityDocuments = await db.collection(collection).get()
  const idsByUser = new Map()
  for (const entity of entityDocuments.docs) {
    const team = await entity.ref.collection('team').get()
    for (const member of team.docs) {
      const uid = text(member.get('user_id'))
      if (!uid || member.id !== uid || text(member.get('status')) !== 'active')
        continue
      const ids = idsByUser.get(uid) || []
      ids.push(entity.id)
      idsByUser.set(uid, ids)
    }
  }

  const operations = []
  for (const [uid, discovered] of [...idsByUser].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    if (requestedUser && uid !== requestedUser) continue
    const ref = db.doc(`apps/${appId}/users/${uid}`)
    const membership = await ref.get()
    if (!membership.exists) {
      operations.push({ uid, path: ref.path, blocker: 'missing AppUser' })
      continue
    }
    const data = membership.data() || {}
    const ids = strings([...strings(data[idsField]), ...discovered])
    const storedPrimary = text(data[primaryField])
    const legacyPrimary =
      family === 'kitchen'
        ? text(
            (await db.doc(`users/${uid}/private/kitchen`).get()).get(
              'primary_kitchen_id'
            )
          )
        : ''
    const primary = ids.includes(storedPrimary)
      ? storedPrimary
      : ids.includes(legacyPrimary)
        ? legacyPrimary
        : ids.length === 1
          ? ids[0]
          : ''
    if (
      sha256(strings(data[idsField])) === sha256(ids) &&
      text(data[primaryField]) === primary
    )
      continue
    operations.push({
      uid,
      path: ref.path,
      sourceSha256: sha256(data),
      ids,
      primary,
    })
  }

  const plan = {
    format: 'fireux-app-user-workspace-index-plan/1',
    projectId: target.projectId || auth.projectId,
    databaseId,
    appId,
    family,
    requestedUser,
    operations,
  }
  const planSha256 = sha256(plan)
  if (!apply) {
    console.log(
      JSON.stringify(
        { mode: 'plan', plan_sha256: planSha256, ...plan },
        null,
        2
      )
    )
    process.exitCode = operations.length ? 2 : 0
  } else {
    if (text(args.confirm) !== planSha256)
      throw new Error(`Apply requires --confirm ${planSha256}`)
    const backupPath = text(args.backup)
    if (
      !backupPath.startsWith('/private/tmp/') ||
      !backupPath.endsWith('.json')
    )
      throw new Error(
        'Apply requires a new --backup /private/tmp/<name>.json path.'
      )
    const documents = []
    if (operations.some((operation) => operation.blocker)) {
      throw new Error(
        'Apply is blocked while the plan contains missing AppUsers.'
      )
    }
    for (const operation of operations) {
      const snapshot = await db.doc(operation.path).get()
      if (
        !snapshot.exists ||
        sha256(snapshot.data()) !== operation.sourceSha256
      )
        throw new Error(`Migration plan changed at ${operation.path}`)
      documents.push({
        path: operation.path,
        exists: true,
        data: stable(snapshot.data()),
      })
    }
    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: {
        format: 'fireux-app-user-workspace-index-preimage/1',
        capturedAt: new Date().toISOString(),
        planSha256,
        documents,
      },
    })
    const memberships = defineFirestoreMutationTarget({
      key: `migration.${family}.app-users`,
      lane: 'mcp-skill',
      verbs: ['update'],
      database: { kind: 'named', databaseId },
      collectionPath: `apps/${appId}/users`,
    })
    for (const operation of operations) {
      await mcpSkillUpdate(app, memberships, operation.uid, {
        [idsField]: operation.ids,
        [primaryField]: operation.primary,
      })
    }
    console.log(
      JSON.stringify(
        {
          mode: 'applied',
          plan_sha256: planSha256,
          operationCount: operations.length,
          backup: backup.path,
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(app)
}
