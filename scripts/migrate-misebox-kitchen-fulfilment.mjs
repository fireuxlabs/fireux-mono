#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-22
// usage_note: dry-run or explicitly create canonical Kitchen fulfilment policy records from protected root preimages.

import { createHash } from 'node:crypto'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'
import { readKitchenFulfilmentConfig } from '../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-fulfilment-reader.ts'

const ECOSYSTEM = 'misebox'
const DATABASE_ID = 'misebox'
const EXPECTED_KITCHENS = 15
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
const hasKeys = (value) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0
const hasPolicyData = (value) =>
  value.delivery_zones.length > 0 || value.payment_methods.length > 0

if (args.help) {
  console.log(`
Create canonical Kitchen fulfilment policy children without changing roots.

Dry run:
  node scripts/migrate-misebox-kitchen-fulfilment.mjs

Apply reviewed create-only plan:
  node scripts/migrate-misebox-kitchen-fulfilment.mjs --apply \\
    --confirm <planSha256> \\
    --backup /private/tmp/misebox-kitchen-fulfilment-preimage.json
`)
  process.exit(0)
}
if (!apply && (args.confirm || args.backup)) {
  throw new Error('--confirm and --backup are valid only with --apply.')
}

const firebaseTarget = await resolveEcosystemFirebaseTarget(ECOSYSTEM)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ECOSYSTEM,
  projectId: firebaseTarget.projectId,
})
const projectId = firebaseTarget.projectId || auth.projectId
const app = initializeApp(
  { credential: auth.credential, projectId },
  `migrate-misebox-kitchen-fulfilment-${Date.now()}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const roots = await db.collection('kitchens').orderBy('__name__').get()
  const blockers = []
  const kitchens = []
  const operations = []
  if (roots.size !== EXPECTED_KITCHENS) {
    blockers.push({
      reason: `Expected exactly ${EXPECTED_KITCHENS} Kitchen roots; found ${roots.size}.`,
    })
  }

  for (const root of roots.docs) {
    const rootData = root.data() || {}
    const rootFulfilment = rootData.fulfilment
    const destinationPath = `kitchens/${root.id}/fulfilment/policy`
    const destination = await db.doc(destinationPath).get()
    const normalized = readKitchenFulfilmentConfig(rootData)
    const row = {
      kitchenId: root.id,
      slug: text(rootData.slug),
      rootPath: root.ref.path,
      destinationPath,
      rootDocumentSha256: sha256(rootData),
      rootFulfilmentSha256: sha256(rootFulfilment ?? null),
      normalizedSha256: sha256(normalized),
      destinationExists: destination.exists,
      destinationSha256: destination.exists ? sha256(destination.data()) : null,
      rootPreimageNonEmpty: hasKeys(rootFulfilment),
      normalizedNonEmpty: hasPolicyData(normalized),
    }
    kitchens.push(row)
    if (!row.rootPreimageNonEmpty) continue
    if (!row.normalizedNonEmpty) {
      blockers.push({
        path: root.ref.path,
        reason: 'Non-empty root fulfilment normalizes to an empty policy.',
      })
      continue
    }
    if (destination.exists) {
      if (row.destinationSha256 !== row.normalizedSha256) {
        blockers.push({
          path: destinationPath,
          reason: 'Existing child differs from normalized root fulfilment.',
          rootSha256: row.normalizedSha256,
          destinationSha256: row.destinationSha256,
        })
      }
      continue
    }
    operations.push({
      kitchenId: root.id,
      rootPath: root.ref.path,
      destinationPath,
      rootDocumentSha256: row.rootDocumentSha256,
      value: stable(normalized),
      valueSha256: row.normalizedSha256,
    })
  }

  const planBase = {
    format: 'fireux-misebox-kitchen-fulfilment-plan/1',
    projectId,
    databaseId: DATABASE_ID,
    expectedKitchenRoots: EXPECTED_KITCHENS,
    kitchenRoots: roots.size,
    nonEmptyRootPreimages: kitchens.filter((row) => row.rootPreimageNonEmpty)
      .length,
    equalExistingChildren: kitchens.filter(
      (row) =>
        row.destinationExists && row.destinationSha256 === row.normalizedSha256
    ).length,
    emptyRootPreimages: kitchens.filter((row) => !row.rootPreimageNonEmpty)
      .length,
    blockers,
    kitchens,
    operations,
  }
  const planSha256 = sha256(planBase)
  const plan = { ...planBase, planSha256 }

  if (!apply) {
    console.log(
      JSON.stringify(
        args.summary
          ? {
              mode: 'dry-run',
              projectId,
              databaseId: DATABASE_ID,
              planSha256,
              kitchenRoots: roots.size,
              nonEmptyRootPreimages: plan.nonEmptyRootPreimages,
              emptyRootPreimages: plan.emptyRootPreimages,
              equalExistingChildren: plan.equalExistingChildren,
              operations: operations.length,
              blockers,
              migratedKitchens: kitchens.filter(
                (row) => row.rootPreimageNonEmpty
              ),
            }
          : { mode: 'dry-run', ...plan },
        null,
        2
      )
    )
    process.exitCode = blockers.length ? 2 : 0
  } else {
    if (blockers.length)
      throw new Error(`Apply blocked by ${blockers.length} conflict(s).`)
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

    const documents = []
    for (const operation of operations) {
      const [root, destination] = await Promise.all([
        db.doc(operation.rootPath).get(),
        db.doc(operation.destinationPath).get(),
      ])
      if (
        !root.exists ||
        sha256(root.data()) !== operation.rootDocumentSha256 ||
        destination.exists
      ) {
        throw new Error(
          `Migration precondition changed at ${operation.destinationPath}`
        )
      }
      documents.push(
        { path: operation.rootPath, exists: true, data: stable(root.data()) },
        { path: operation.destinationPath, exists: false, data: null }
      )
    }
    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: {
        format: 'fireux-misebox-kitchen-fulfilment-preimage/1',
        capturedAt: new Date().toISOString(),
        planSha256,
        projectId,
        databaseId: DATABASE_ID,
        documents,
      },
    })
    const targetFor = (kitchenId) =>
      defineFirestoreMutationTarget({
        key: 'misebox-kitchen-fulfilment.policy',
        lane: 'mcp-skill',
        verbs: ['create'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: `kitchens/${kitchenId}/fulfilment`,
      })

    for (const operation of operations) {
      await mcpSkillCreate(
        app,
        targetFor(operation.kitchenId),
        'policy',
        operation.value
      )
      const [root, destination] = await Promise.all([
        db.doc(operation.rootPath).get(),
        db.doc(operation.destinationPath).get(),
      ])
      if (
        !root.exists ||
        sha256(root.data()) !== operation.rootDocumentSha256 ||
        !destination.exists ||
        sha256(destination.data()) !== operation.valueSha256
      ) {
        throw new Error(
          `Post-write verification failed at ${operation.destinationPath}. Backup: ${backup.path}`
        )
      }
    }
    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          created: operations.length,
          unchangedRoots: roots.size,
          planSha256,
          backup,
          postWriteVerified: true,
          recovery: operations.map(
            (operation) => `delete ${operation.destinationPath}`
          ),
        },
        null,
        2
      )
    )
  }
} finally {
  await deleteApp(app)
}
