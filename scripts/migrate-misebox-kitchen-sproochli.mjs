#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-22
// usage_note: dry-run or explicitly create canonical Kitchen Sproochli attachment children from protected root preimages.

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
import {
  normalizeSproochliDefaultLanguage,
  readSproochliAttachmentConfig,
} from '../packages/extensions/fireux-sproochli/src/runtime/utils/attachment.ts'

const ECOSYSTEM = 'misebox'
const DATABASE_ID = 'misebox'
const EXPECTED_KITCHENS = 16
const ALLOWED_FIELDS = new Set([
  'enabled',
  'default_language',
  'profile_id',
  'requested_languages',
])
const args = parseArgs(process.argv.slice(2))
const apply = args.apply === true
const text = (value) => String(value ?? '').trim()
const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null
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
const hasKeys = (value) => Boolean(record(value) && Object.keys(value).length)

function normalizeValidAttachment(value) {
  const source = record(value)
  if (!source) throw new Error('Sproochli attachment must be an object.')
  const unsupported = Object.keys(source).find(
    (key) => !ALLOWED_FIELDS.has(key)
  )
  if (unsupported) {
    throw new Error(`Unsupported Sproochli attachment field: ${unsupported}.`)
  }
  if (typeof source.enabled !== 'boolean') {
    throw new Error('Sproochli attachment enabled must be a boolean.')
  }
  if (
    source.default_language !== undefined &&
    !normalizeSproochliDefaultLanguage(source.default_language)
  ) {
    throw new Error('Sproochli attachment default_language is invalid.')
  }
  if (
    source.profile_id !== undefined &&
    (typeof source.profile_id !== 'string' || !text(source.profile_id))
  ) {
    throw new Error('Sproochli attachment profile_id is invalid.')
  }
  if (
    source.requested_languages !== undefined &&
    !Array.isArray(source.requested_languages)
  ) {
    throw new Error(
      'Sproochli attachment requested_languages must be an array.'
    )
  }
  const normalized = readSproochliAttachmentConfig(source)
  if (
    Array.isArray(source.requested_languages) &&
    normalized.requested_languages.length !== source.requested_languages.length
  ) {
    throw new Error('Sproochli attachment requested_languages is invalid.')
  }
  return normalized
}

if (args.help) {
  console.log(`
Create canonical Kitchen Sproochli attachment children without changing roots.

Dry run:
  node scripts/migrate-misebox-kitchen-sproochli.mjs

Apply reviewed create-only plan:
  node scripts/migrate-misebox-kitchen-sproochli.mjs --apply \\
    --confirm <planSha256> \\
    --backup /private/tmp/misebox-kitchen-sproochli-preimage.json
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
  `migrate-misebox-kitchen-sproochli-${Date.now()}`
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
    const rootAttachment = record(rootData.integrations)?.sproochli
    const destinationPath = `kitchens/${root.id}/integrations/sproochli`
    const destination = await db.doc(destinationPath).get()
    let normalized = null
    let validationError = null
    if (hasKeys(rootAttachment)) {
      try {
        normalized = normalizeValidAttachment(rootAttachment)
      } catch (error) {
        validationError = error instanceof Error ? error.message : String(error)
      }
    }
    const normalizedSha256 = normalized ? sha256(normalized) : null
    const destinationSha256 = destination.exists
      ? sha256(readSproochliAttachmentConfig(destination.data()))
      : null
    const row = {
      kitchenId: root.id,
      slug: text(rootData.slug),
      rootPath: root.ref.path,
      destinationPath,
      rootDocumentSha256: sha256(rootData),
      rootAttachmentSha256: sha256(rootAttachment ?? null),
      normalizedSha256,
      destinationExists: destination.exists,
      destinationDocumentSha256: destination.exists
        ? sha256(destination.data())
        : null,
      destinationNormalizedSha256: destinationSha256,
      rootPreimageNonEmpty: hasKeys(rootAttachment),
      validationError,
    }
    kitchens.push(row)
    if (!row.rootPreimageNonEmpty) continue
    if (!normalized || validationError) {
      blockers.push({ path: root.ref.path, reason: validationError })
      continue
    }
    if (destination.exists) {
      if (destinationSha256 !== normalizedSha256) {
        blockers.push({
          path: destinationPath,
          reason: 'Existing child differs from normalized root attachment.',
          rootSha256: normalizedSha256,
          destinationSha256,
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
      valueSha256: normalizedSha256,
    })
  }

  const planBase = {
    format: 'fireux-misebox-kitchen-sproochli-plan/1',
    projectId,
    databaseId: DATABASE_ID,
    expectedKitchenRoots: EXPECTED_KITCHENS,
    kitchenRoots: roots.size,
    nonEmptyRootPreimages: kitchens.filter((row) => row.rootPreimageNonEmpty)
      .length,
    equalExistingChildren: kitchens.filter(
      (row) =>
        row.destinationExists &&
        row.destinationNormalizedSha256 === row.normalizedSha256
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
    console.log(JSON.stringify({ mode: 'dry-run', ...plan }, null, 2))
    process.exitCode = blockers.length ? 2 : 0
  } else {
    if (blockers.length) {
      throw new Error(`Apply blocked by ${blockers.length} conflict(s).`)
    }
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
        format: 'fireux-misebox-kitchen-sproochli-preimage/1',
        capturedAt: new Date().toISOString(),
        planSha256,
        projectId,
        databaseId: DATABASE_ID,
        documents,
      },
    })
    const targetFor = (kitchenId) =>
      defineFirestoreMutationTarget({
        key: 'misebox-kitchen-integrations.sproochli',
        lane: 'mcp-skill',
        verbs: ['create'],
        database: { kind: 'named', databaseId: DATABASE_ID },
        collectionPath: `kitchens/${kitchenId}/integrations`,
      })

    for (const operation of operations) {
      await mcpSkillCreate(
        app,
        targetFor(operation.kitchenId),
        'sproochli',
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
        sha256(readSproochliAttachmentConfig(destination.data())) !==
          operation.valueSha256
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
