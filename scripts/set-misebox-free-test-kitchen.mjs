#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-23
// usage_note: keep Interlaken Pizza as the fixed developer Free-test Kitchen while preserving reversible Team preimages.

import { createHash } from 'node:crypto'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const USER_ID = 'jMK33p5XlhYS8rBCEf8qUiogfMg2'
const KITCHEN_ID = 'ChIJWcym7tulj0cRb3N2twqVj1U'
const args = parseArgs(process.argv.slice(2))
const allowedArgs = new Set(['apply', 'backup', 'confirm', 'help'])
for (const key of Object.keys(args)) {
  if (!allowedArgs.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Dry run:
  node scripts/set-misebox-free-test-kitchen.mjs

Apply reviewed plan:
  node scripts/set-misebox-free-test-kitchen.mjs --apply --confirm <planSha256> \\
    --backup /private/tmp/misebox-free-test-kitchen-preimage.json
`)
  process.exit(0)
}

const text = value => String(value ?? '').trim()
const stable = value => {
  if (value == null || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(stable)
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, stable(entry)])
  )
}
const hash = value =>
  createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')

const auth = await resolveFirebaseAdminCredential({
  scope: 'misebox',
  projectId: 'misebox-78f9c',
})
const app = initializeApp(
  { credential: auth.credential, projectId: 'misebox-78f9c' },
  `misebox-free-test-kitchen-${Date.now()}`
)

try {
  const db = getFirestore(app, 'misebox')
  const membership = await db.doc(`apps/misebox-app/users/${USER_ID}`).get()
  if (!membership.exists || membership.data()?.subscription !== 'free') {
    throw new Error('Fixed Misebox AppUser must exist with subscription free.')
  }

  const snapshot = await db
    .collectionGroup('team')
    .where('user_id', '==', USER_ID)
    .where('status', '==', 'active')
    .get()
  const members = snapshot.docs.filter(doc => {
    const parts = doc.ref.path.split('/')
    return (
      parts.length === 4 &&
      parts[0] === 'kitchens' &&
      parts[2] === 'team' &&
      parts[3] === USER_ID
    )
  })
  const retained = members.find(doc => doc.ref.parent.parent?.id === KITCHEN_ID)
  if (!retained) throw new Error('Interlaken Pizza owner membership is not active.')
  const changes = members
    .filter(doc => doc.ref.parent.parent?.id !== KITCHEN_ID)
    .map(doc => ({
      kitchenId: text(doc.ref.parent.parent?.id),
      path: doc.ref.path,
      preimage: doc.data(),
    }))
    .sort((left, right) => left.kitchenId.localeCompare(right.kitchenId))
  const plan = {
    projectId: 'misebox-78f9c',
    databaseId: 'misebox',
    userId: USER_ID,
    retainedKitchenId: KITCHEN_ID,
    deactivate: changes.map(change => ({
      kitchenId: change.kitchenId,
      path: change.path,
      preconditionSha256: hash(change.preimage),
    })),
  }
  const planSha256 = hash(plan)
  console.log(JSON.stringify({ ...plan, planSha256 }, null, 2))
  if (!args.apply) process.exit(0)
  if (text(args.confirm) !== planSha256) {
    throw new Error('Apply requires --confirm with the current planSha256.')
  }
  const backupPath = text(args.backup)
  if (!backupPath.startsWith('/private/tmp/')) {
    throw new Error('--backup must be a new path under /private/tmp/.')
  }
  const backup = await writeProtectedJsonArtifact({
    path: backupPath,
    payload: {
      ...plan,
      records: changes.map(change => ({
        path: change.path,
        data: stable(change.preimage),
      })),
    },
  })
  for (const change of changes) {
    const current = await db.doc(change.path).get()
    if (!current.exists || hash(current.data()) !== hash(change.preimage)) {
      throw new Error(`Membership changed after planning: ${change.path}`)
    }
    const target = defineFirestoreMutationTarget({
      key: `misebox-free-test-kitchen-${change.kitchenId}`,
      lane: 'mcp-skill',
      verbs: ['update'],
      database: { kind: 'named', databaseId: 'misebox' },
      collectionPath: `kitchens/${change.kitchenId}/team`,
    })
    await mcpSkillUpdate(app, target, USER_ID, {
      active: false,
      status: 'inactive',
      updated: {
        by: 'system:set-misebox-free-test-kitchen',
        at: FieldValue.serverTimestamp(),
      },
    })
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        retainedKitchenId: KITCHEN_ID,
        deactivated: changes.length,
        backup,
      },
      null,
      2
    )
  )
} finally {
  await deleteApp(app)
}
