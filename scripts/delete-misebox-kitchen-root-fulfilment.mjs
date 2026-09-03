#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-22
// usage_note: dry-run or explicitly delete the two equal Kitchen root fulfilment preimages after child-only runtime cutover and retained managed-export proof.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'
import { readKitchenFulfilmentConfig } from '../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-fulfilment-reader.ts'

const DATABASE_ID = 'misebox'
const EXPECTED_KITCHENS = 16
const EXPECTED_DELETIONS = 2
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const stable = (value) => {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(stable)
  if (typeof value.toDate === 'function') {
    return { __timestamp: value.toDate().toISOString() }
  }
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, stable(child)])
  )
}
const sha256 = (value) =>
  createHash('sha256')
    .update(JSON.stringify(stable(value)))
    .digest('hex')
const retainedExport = text(args['export-uri'])
const validExport =
  retainedExport.startsWith(
    'gs://misebox-78f9c-firestore-migrations/entity-canon-'
  ) && !retainedExport.endsWith('/')

if (!apply && (args.confirm || args.backup)) {
  throw new Error('--confirm and --backup are valid only with --apply.')
}

const target = await resolveEcosystemFirebaseTarget('misebox')
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: 'misebox',
  projectId: target.projectId,
})
const projectId = target.projectId || auth.projectId
const app = initializeApp(
  { credential: auth.credential, projectId },
  `delete-misebox-kitchen-root-fulfilment-${Date.now()}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const roots = await db.collection('kitchens').orderBy('__name__').get()
  const operations = []
  const blockers = []
  if (roots.size !== EXPECTED_KITCHENS) {
    blockers.push(
      `Expected ${EXPECTED_KITCHENS} Kitchen roots; found ${roots.size}.`
    )
  }
  for (const root of roots.docs) {
    const rootData = root.data() || {}
    if (!Object.hasOwn(rootData, 'fulfilment')) continue
    const childPath = `kitchens/${root.id}/fulfilment/policy`
    const child = await db.doc(childPath).get()
    const normalized = readKitchenFulfilmentConfig(rootData)
    if (!child.exists) {
      blockers.push(`Missing child policy: ${childPath}`)
      continue
    }
    const rootPolicySha256 = sha256(normalized)
    const childSha256 = sha256(child.data())
    if (rootPolicySha256 !== childSha256) {
      blockers.push(`Unequal root and child policy: ${childPath}`)
      continue
    }
    const rootAfter = { ...rootData }
    delete rootAfter.fulfilment
    operations.push({
      kitchenId: root.id,
      rootPath: root.ref.path,
      childPath,
      rootDocumentSha256: sha256(rootData),
      rootFulfilmentSha256: sha256(rootData.fulfilment),
      childSha256,
      rootAfterSha256: sha256(rootAfter),
      rootFulfilment: stable(rootData.fulfilment),
    })
  }
  if (operations.length !== EXPECTED_DELETIONS) {
    blockers.push(
      `Expected exactly ${EXPECTED_DELETIONS} equal root fields; found ${operations.length}.`
    )
  }
  if (!validExport) {
    blockers.push(
      'Missing verified retained managed export URI; /private/tmp preimages do not satisfy this gate.'
    )
  }

  const planBase = {
    format: 'fireux-misebox-kitchen-root-fulfilment-delete-plan/1',
    projectId,
    databaseId: DATABASE_ID,
    kitchenRoots: roots.size,
    retainedExport: validExport ? retainedExport : null,
    operations,
    blockers,
  }
  const planSha256 = sha256(planBase)
  const plan = { ...planBase, planSha256 }
  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', ...plan }, null, 2))
    process.exitCode = blockers.length ? 2 : 0
  } else {
    if (blockers.length)
      throw new Error(`Deletion blocked: ${blockers.join(' ')}`)
    if (text(args.confirm) !== planSha256) {
      throw new Error(`Apply requires --confirm ${planSha256}`)
    }
    const backupPath = text(args.backup)
    if (
      !backupPath.startsWith('/private/tmp/') ||
      !backupPath.endsWith('.json')
    ) {
      throw new Error(
        'Apply requires a new --backup /private/tmp/<name>.json path.'
      )
    }
    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: {
        format: 'fireux-misebox-kitchen-root-fulfilment-delete-preimage/1',
        capturedAt: new Date().toISOString(),
        retainedExport,
        plan,
      },
    })
    const rootTarget = defineFirestoreMutationTarget({
      key: 'misebox-kitchen-root-fulfilment-retirement',
      lane: 'mcp-skill',
      verbs: ['update'],
      database: { kind: 'named', databaseId: DATABASE_ID },
      collectionPath: 'kitchens',
    })
    for (const operation of operations) {
      const [root, child] = await Promise.all([
        db.doc(operation.rootPath).get(),
        db.doc(operation.childPath).get(),
      ])
      if (
        !root.exists ||
        sha256(root.data()) !== operation.rootDocumentSha256 ||
        !child.exists ||
        sha256(child.data()) !== operation.childSha256
      ) {
        throw new Error(
          `Deletion precondition changed at ${operation.rootPath}`
        )
      }
      await mcpSkillUpdate(app, rootTarget, operation.kitchenId, {
        fulfilment: FieldValue.delete(),
      })
      const verified = await db.doc(operation.rootPath).get()
      if (
        !verified.exists ||
        Object.hasOwn(verified.data() || {}, 'fulfilment') ||
        sha256(verified.data()) !== operation.rootAfterSha256
      ) {
        throw new Error(
          `Post-delete verification failed at ${operation.rootPath}. Backup: ${backup.path}`
        )
      }
    }
    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          deletedRootFields: operations.length,
          planSha256,
          backup,
          recovery: operations.map((operation) => ({
            path: operation.rootPath,
            restore: { fulfilment: operation.rootFulfilment },
          })),
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(app)
}
