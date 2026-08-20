#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-20
// usage_note: plan or explicitly apply the protected legacy AppKitchen console-map to canonical Kitchen ownership cutover.

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

const ECOSYSTEM = 'misebox'
const DATABASE_ID = 'misebox'
const LEGACY_SUPPORT_FIELD = 'console'
const OWNED_FIELDS = [
  'theme',
  'menus',
  'orders',
  'tables',
  'fulfilment',
  'integrations',
]

const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = value => String(value ?? '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const stable = value => {
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
const sha256 = value =>
  createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
const equal = (left, right) => sha256(left) === sha256(right)

if (args.help) {
  console.log(`
Move Kitchen-owned configuration out of the legacy AppKitchen console map.

Dry run:
  pnpm migrate:misebox-kitchen-ownership -- --summary

Explicit apply after reviewing the full plan:
  pnpm migrate:misebox-kitchen-ownership -- --apply --confirm <planSha256> \\
    --backup /private/tmp/misebox-kitchen-ownership-preimage.json

The plan blocks if a canonical Kitchen field conflicts with the legacy support map.
Apply never overwrites an existing canonical value.
`)
  process.exit(0)
}

const target = await resolveEcosystemFirebaseTarget(ECOSYSTEM)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ECOSYSTEM,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `migrate-misebox-kitchen-ownership-${Date.now()}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const appDocuments = await db.collection('apps').get()
  const operations = []
  const blockers = []

  for (const appDocument of appDocuments.docs) {
    const supports = await appDocument.ref.collection('kitchens').get()
    for (const supportDocument of supports.docs) {
      const support = supportDocument.data() || {}
      const legacy = record(support[LEGACY_SUPPORT_FIELD])
      if (!Object.keys(legacy).length) continue

      const rootRef = db.doc(`kitchens/${supportDocument.id}`)
      const rootDocument = await rootRef.get()
      if (!rootDocument.exists) {
        blockers.push({
          path: supportDocument.ref.path,
          reason: `Canonical Kitchen is missing: ${rootRef.path}`,
        })
        continue
      }

      const root = rootDocument.data() || {}
      const patch = {}
      const conflicts = []
      for (const field of OWNED_FIELDS) {
        if (!Object.hasOwn(legacy, field)) continue
        if (!Object.hasOwn(root, field)) patch[field] = legacy[field]
        else if (!equal(root[field], legacy[field])) conflicts.push(field)
      }
      const unknownFields = Object.keys(legacy)
        .filter(field => !OWNED_FIELDS.includes(field))
        .sort()
      if (conflicts.length || unknownFields.length) {
        blockers.push({
          path: supportDocument.ref.path,
          conflicts,
          unknownFields,
          reason: 'Legacy Workspace data cannot be moved without a human decision.',
        })
        continue
      }

      operations.push({
        appId: appDocument.id,
        kitchenId: supportDocument.id,
        rootPath: rootRef.path,
        supportPath: supportDocument.ref.path,
        rootSha256: sha256(root),
        supportSha256: sha256(support),
        patch: stable(patch),
      })
    }
  }

  const planBase = {
    format: 'fireux-misebox-kitchen-ownership-plan/1',
    projectId: target.projectId || auth.projectId,
    databaseId: DATABASE_ID,
    ownedFields: OWNED_FIELDS,
    blockers,
    operations,
  }
  const planSha256 = sha256(planBase)
  const plan = { ...planBase, planSha256 }

  if (!apply) {
    console.log(JSON.stringify(
      args.summary
        ? {
            mode: 'dry-run',
            projectId: plan.projectId,
            databaseId: DATABASE_ID,
            planSha256,
            operations: operations.length,
            blockers,
          }
        : { mode: 'dry-run', ...plan },
      null,
      2
    ))
    process.exitCode = blockers.length ? 2 : 0
  } else {
    if (blockers.length) {
      throw new Error(`Apply blocked by ${blockers.length} unresolved record(s).`)
    }
    if (text(args.confirm) !== planSha256) {
      throw new Error(`Apply requires --confirm ${planSha256}`)
    }
    const backupPath = text(args.backup)
    if (!backupPath.startsWith('/private/tmp/') || !backupPath.endsWith('.json')) {
      throw new Error('Apply requires a new --backup /private/tmp/<name>.json path.')
    }

    const preimage = []
    for (const operation of operations) {
      const [rootDocument, supportDocument] = await Promise.all([
        db.doc(operation.rootPath).get(),
        db.doc(operation.supportPath).get(),
      ])
      if (
        !rootDocument.exists ||
        !supportDocument.exists ||
        sha256(rootDocument.data()) !== operation.rootSha256 ||
        sha256(supportDocument.data()) !== operation.supportSha256
      ) {
        throw new Error(`Data changed after planning: ${operation.supportPath}`)
      }
      preimage.push(
        { path: operation.rootPath, data: stable(rootDocument.data()) },
        { path: operation.supportPath, data: stable(supportDocument.data()) }
      )
    }
    const backup = await writeProtectedJsonArtifact({
      path: backupPath,
      payload: {
        format: 'fireux-misebox-kitchen-ownership-preimage/1',
        capturedAt: new Date().toISOString(),
        planSha256,
        projectId: plan.projectId,
        databaseId: DATABASE_ID,
        documents: preimage,
      },
    })

    for (const operation of operations) {
      const actor = `fireux-kitchen-ownership-migration:${operation.appId}`
      const rootTarget = defineFirestoreMutationTarget({
        key: 'misebox-kitchen-ownership.root',
        lane: 'mcp-skill',
        verbs: ['update'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: 'kitchens',
      })
      if (Object.keys(operation.patch).length) {
        await mcpSkillUpdate(app, rootTarget, operation.kitchenId, {
          ...operation.patch,
          updated: { at: FieldValue.serverTimestamp(), by: actor },
        })
      }
      const canonical = (await db.doc(operation.rootPath).get()).data() || {}
      for (const field of OWNED_FIELDS) {
        if (
          Object.hasOwn(operation.patch, field) &&
          !equal(canonical[field], operation.patch[field])
        ) throw new Error(`Canonical verification failed: ${operation.rootPath}.${field}`)
      }

      const supportTarget = defineFirestoreMutationTarget({
        key: 'misebox-kitchen-ownership.support',
        lane: 'mcp-skill',
        verbs: ['update'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: `apps/${operation.appId}/kitchens`,
      })
      await mcpSkillUpdate(app, supportTarget, operation.kitchenId, {
        [LEGACY_SUPPORT_FIELD]: FieldValue.delete(),
        updated: { at: FieldValue.serverTimestamp(), by: actor },
      })
      const verifiedSupport = (await db.doc(operation.supportPath).get()).data() || {}
      if (Object.hasOwn(verifiedSupport, LEGACY_SUPPORT_FIELD)) {
        throw new Error(`Support cleanup failed: ${operation.supportPath}`)
      }
    }

    console.log(JSON.stringify({
      mode: 'apply',
      migrated: operations.length,
      planSha256,
      backup,
      postWriteVerified: true,
    }, null, 2))
  }
} finally {
  await deleteApp(app)
}
