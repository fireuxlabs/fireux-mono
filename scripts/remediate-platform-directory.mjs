#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: preflight and explicitly apply the locked one-time App/Ecosystem owner remediation with a local preimage backup.
// Concurrent edit — 2026-07-20 12:15 CEST — Directory Remediation Journal: make dry-run strictly read-only and close authority races.
// Concurrent edit — 2026-07-20 12:27 CEST — Directory Live Pass: apply and verify the locked 13-decision remediation.

import { createHash, randomUUID } from 'node:crypto'
import { chmod, mkdir, open, readFile, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { buildPlatformDirectoryRemediationPlan } from './_lib/platform-directory-remediation.mjs'
import {
  LOCKED_RECONCILIATION_SHA256,
  PLATFORM_DIRECTORY_BOOTSTRAP_ASSUMPTIONS,
  PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION,
  PLATFORM_DIRECTORY_REMEDIATION_EXECUTION_VERSION,
  PLATFORM_DIRECTORY_REMEDIATION_JOURNAL_VERSION,
  assertApplyConfirmation,
  assertBootstrapOwnerMissing,
  assertBootstrapPlatformPrecondition,
  assertCredentialFreeBackup,
  assertLockedReconciliationHash,
  assertRepairDocumentPrecondition,
  assertStandardTargetCatalog,
  buildAppOwnerBootstrapPayload,
  buildEcosystemOwnerBootstrapPayload,
  buildRemediationPreimageBackup,
  directoryReportRow,
  expectedBootstrapPublicHash,
  hashRemediationAuthorityInputs,
  readValidatedRemediationSources,
  remediationEntityKey,
  remediationTargetKey,
  verifyBootstrapDocument,
  verifyRepairDocument,
} from './_lib/platform-directory-remediation-executor.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const text = (value) => String(value ?? '').trim()

const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

function parseStrictArgs(argv) {
  const flags = new Set(['help', 'apply'])
  const values = new Set([
    'report',
    'backup-dir',
    'confirm',
    'expect-report-sha256',
    'service-account',
  ])
  const result = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${token}`)
    }
    const separator = token.indexOf('=')
    const key = token.slice(2, separator === -1 ? undefined : separator)
    const inlineValue =
      separator === -1 ? undefined : token.slice(separator + 1)
    if (!key) throw new Error('Empty option is not allowed.')
    if (key in result) throw new Error(`Duplicate option: --${key}`)

    if (flags.has(key)) {
      if (inlineValue !== undefined) {
        throw new Error(`Option --${key} does not accept a value.`)
      }
      result[key] = true
      continue
    }
    if (!values.has(key)) throw new Error(`Unknown option: --${key}`)

    const value = inlineValue === undefined ? argv[index + 1] : inlineValue
    if (!value || value.startsWith('--')) {
      throw new Error(`Option --${key} requires a value.`)
    }
    result[key] = value
    if (inlineValue === undefined) index += 1
  }

  return result
}

function resolveRepoFile(value, fallback, label) {
  const resolved = path.resolve(repoRoot, String(value || fallback).trim())
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must be below the repository root.`)
  }
  if (!resolved.endsWith('.json')) {
    throw new Error(`${label} must be a JSON file.`)
  }
  return resolved
}

function resolveRepoDirectory(value, fallback, label) {
  const resolved = path.resolve(repoRoot, String(value || fallback).trim())
  const relative = path.relative(repoRoot, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must be below the repository root.`)
  }
  return resolved
}

function printUsage() {
  console.log(`Usage:
  node scripts/remediate-platform-directory.mjs
  node scripts/remediate-platform-directory.mjs --apply \\
    --expect-report-sha256 ${LOCKED_RECONCILIATION_SHA256} \\
    --confirm ${PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION}

Defaults:
  --report     temp/platform-directory-reconciliation.json
  --backup-dir temp/platform-directory-remediation-backups

Without --apply, this performs remote reads and full live precondition checks,
but no backup or remote write. Apply requires both the exact report hash and
typed confirmation. No document delete operation exists in this command.

Credential sources, in precedence order:
${firebaseAdminCredentialHelp()
  .map((line) => `  - ${line}`)
  .join('\n')}

All unlisted options are rejected.`)
}

function reportSha256(source) {
  return createHash('sha256').update(source).digest('hex')
}

function databaseKey(target) {
  return `${target.firebase_project_id}/${target.database_id}`
}

function platformBootstrapTarget(plan, bootstrap) {
  const collection = bootstrap.entity_kind === 'app' ? 'apps' : 'ecosystems'
  return {
    ...plan.platformTarget,
    document_path: `${collection}/${bootstrap.entity_id}`,
  }
}

function decisionMap(plan) {
  return new Map(
    plan.decisions.map((decision) => [remediationEntityKey(decision), decision])
  )
}

function uniqueDatabaseTargets(plan) {
  const values = [
    ...plan.repairTargets.map((row) => row.target),
    ...plan.ownerBootstraps.map((row) => row.target),
    ...plan.ownerBootstraps.map((row) => platformBootstrapTarget(plan, row)),
  ]
  return [
    ...new Map(values.map((target) => [databaseKey(target), target])).values(),
  ]
}

async function safeCredentialIdentity(resolved) {
  const credential = resolved.credential
  let principal = text(credential?.clientEmail)

  if (!principal && typeof credential?.getServiceAccountEmail === 'function') {
    try {
      principal = text(await credential.getServiceAccountEmail())
    } catch {
      // Token metadata below covers local user ADC and other credential kinds.
    }
  }

  if (!principal) {
    const access = await credential.getAccessToken()
    const token = text(access?.access_token)
    if (!token)
      throw new Error('Resolved Firebase credential returned no token.')
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ access_token: token }),
    })
    if (!response.ok) {
      throw new Error(
        `Could not resolve the Firebase principal (HTTP ${response.status}).`
      )
    }
    const tokenInfo = record(await response.json())
    principal = text(tokenInfo.email)
  }

  if (!principal) {
    throw new Error('Resolved Firebase credential has no auditable principal.')
  }
  return {
    source: text(resolved.source),
    project_id: text(resolved.projectId),
    principal,
  }
}

class FirebaseTargetPool {
  constructor({ args, catalog }) {
    this.args = args
    this.catalog = catalog
    this.projectPromises = new Map()
    this.credentialPromises = new Map()
    this.apps = new Map()
    this.databases = new Map()
  }

  async credentialFor(target) {
    const projectId = target.firebase_project_id
    const existing = this.credentialPromises.get(projectId)
    if (existing) return existing

    const promise = (async () => {
      const metadata = this.catalog.get(databaseKey(target))
      if (!metadata) {
        throw new Error(
          `Target is absent from the locked catalog: ${databaseKey(target)}.`
        )
      }
      const resolved = await resolveFirebaseAdminCredential({
        args: this.args,
        scope: metadata.scope,
        projectId,
      })
      return {
        ...resolved,
        identity: await safeCredentialIdentity(resolved),
      }
    })()
    this.credentialPromises.set(projectId, promise)
    return promise
  }

  async appFor(target) {
    const projectId = target.firebase_project_id
    const existing = this.projectPromises.get(projectId)
    if (existing) return existing

    const promise = (async () => {
      const credential = await this.credentialFor(target)
      const safeProjectName = projectId
        .replace(/[^a-zA-Z0-9-]/g, '-')
        .slice(0, 80)
      const app = initializeApp(
        { credential: credential.credential, projectId },
        `directory-remediation-${safeProjectName}`
      )
      this.apps.set(projectId, app)
      return app
    })()
    this.projectPromises.set(projectId, promise)
    return promise
  }

  async dbFor(target) {
    const key = databaseKey(target)
    const existing = this.databases.get(key)
    if (existing) return existing
    const app = await this.appFor(target)
    const db = getFirestore(app, target.database_id)
    this.databases.set(key, db)
    return db
  }

  async close() {
    await Promise.all([...this.apps.values()].map((app) => deleteApp(app)))
  }
}

function snapshotUpdateTime(snapshot) {
  if (!snapshot.updateTime) return ''
  if (
    typeof snapshot.updateTime.seconds === 'number' &&
    typeof snapshot.updateTime.nanoseconds === 'number'
  ) {
    return {
      seconds: snapshot.updateTime.seconds,
      nanoseconds: snapshot.updateTime.nanoseconds,
    }
  }
  return String(snapshot.updateTime)
}

function expectedBeforeHashes(decision, roles) {
  return roles.map((role) => ({
    role,
    sha256:
      role === 'canonical_owner'
        ? decision.precondition.owner_public_hash
        : decision.precondition.platform_public_hash,
  }))
}

async function buildRemotePreflight({ report, plan, sources, pool }) {
  const decisions = decisionMap(plan)
  const readCache = new Map()
  const readTarget = (target) => {
    const key = remediationTargetKey(target)
    if (!readCache.has(key)) {
      readCache.set(
        key,
        (async () => {
          const db = await pool.dbFor(target)
          const ref = db.doc(target.document_path)
          const snapshot = await ref.get()
          return { db, ref, snapshot, target }
        })()
      )
    }
    return readCache.get(key)
  }

  const repairOperations = await Promise.all(
    plan.repairTargets.map(async (repairTarget) => {
      const key = `${repairTarget.entity_kind}/${repairTarget.entity_id}`
      const decision = decisions.get(key)
      if (!decision) throw new Error(`Missing remediation decision: ${key}.`)
      const current = await readTarget(repairTarget.target)
      if (!current.snapshot.updateTime) {
        throw new Error(
          `Relation target has no update-time precondition: ${remediationTargetKey(repairTarget.target)}.`
        )
      }
      const checked = assertRepairDocumentPrecondition({
        decision,
        repairTarget,
        exists: current.snapshot.exists,
        data: current.snapshot.data(),
      })
      return {
        entityKind: repairTarget.entity_kind,
        entityId: repairTarget.entity_id,
        resolution: 'repair_relation',
        classification: decision.precondition.classification,
        target: repairTarget.target,
        targetRoles: repairTarget.target_roles,
        decision,
        repairTarget,
        expectedProjectId: decision.precondition.source.project_id,
        expectedDatabaseId: decision.precondition.source.database_id,
        expectedPostPublicHash: checked.expected_post_public_hash,
        expectedBeforePublicHashes: expectedBeforeHashes(
          decision,
          repairTarget.target_roles
        ),
        beforeFields: checked.before_fields,
        exists: true,
        updateTime: snapshotUpdateTime(current.snapshot),
        lastUpdateTime: current.snapshot.updateTime,
        db: current.db,
        ref: current.ref,
      }
    })
  )

  const bootstrapResults = await Promise.all(
    plan.ownerBootstraps.map(async (bootstrap) => {
      const key = `${bootstrap.entity_kind}/${bootstrap.entity_id}`
      const decision = decisions.get(key)
      const source = sources.get(key)
      if (!decision || !source) {
        throw new Error(`Missing bootstrap authority for ${key}.`)
      }
      const reportRow = directoryReportRow(
        report,
        bootstrap.entity_kind,
        bootstrap.entity_id
      )
      const platformTarget = platformBootstrapTarget(plan, bootstrap)
      const [owner, platform] = await Promise.all([
        readTarget(bootstrap.target),
        readTarget(platformTarget),
      ])
      assertBootstrapOwnerMissing({
        target: bootstrap.target,
        exists: owner.snapshot.exists,
      })
      const platformChecked = assertBootstrapPlatformPrecondition({
        decision,
        reportRow,
        exists: platform.snapshot.exists,
        data: platform.snapshot.data(),
      })
      const timestampFactory = () => FieldValue.serverTimestamp()
      const payload =
        bootstrap.entity_kind === 'app'
          ? buildAppOwnerBootstrapPayload({
              decision,
              source,
              timestampFactory,
            })
          : buildEcosystemOwnerBootstrapPayload({
              decision,
              source,
              platformPublicEntry: platformChecked.publicEntry,
              timestampFactory,
            })
      const expectedPostPublicHash = expectedBootstrapPublicHash({
        decision,
        reportRow,
        payload,
      })
      const readPrecondition = {
        entityKind: bootstrap.entity_kind,
        entityId: bootstrap.entity_id,
        target: platformTarget,
        expectedPublicHash: platformChecked.publicHash,
        exists: platform.snapshot.exists,
        decision,
        reportRow,
        ref: platform.ref,
      }

      return {
        operation: {
          entityKind: bootstrap.entity_kind,
          entityId: bootstrap.entity_id,
          resolution: 'bootstrap_owner',
          classification: decision.precondition.classification,
          target: bootstrap.target,
          decision,
          reportRow,
          expectedCreatorAppId: source.config.id,
          expectedPostPublicHash,
          payload,
          exists: false,
          updateTime: '',
          expectedBeforePublicHashes: [],
          readPrecondition,
          db: owner.db,
          ref: owner.ref,
        },
        readPrecondition,
      }
    })
  )

  return {
    operations: [
      ...repairOperations,
      ...bootstrapResults.map((result) => result.operation),
    ],
    readPreconditions: bootstrapResults.map(
      (result) => result.readPrecondition
    ),
    physicalReads: readCache.size,
  }
}

async function verifyPlatformReadPreconditions(preflight) {
  await verifyReadPreconditions(preflight.readPreconditions)
}

async function verifyReadPreconditions(preconditions) {
  await Promise.all(
    preconditions.map(async (precondition) => {
      const snapshot = await precondition.ref.get()
      assertBootstrapPlatformPrecondition({
        decision: precondition.decision,
        reportRow: precondition.reportRow,
        exists: snapshot.exists,
        data: snapshot.data(),
      })
    })
  )
}

function safePreflightSummary(preflight, plan) {
  const batchCount = new Set(
    preflight.operations.map((operation) => databaseKey(operation.target))
  ).size
  return {
    physicalReads: preflight.physicalReads,
    plannedWrites: preflight.operations.length,
    relationFieldRepairs: preflight.operations.filter(
      (operation) => operation.resolution === 'repair_relation'
    ).length,
    canonicalOwnerCreates: preflight.operations.filter(
      (operation) => operation.resolution === 'bootstrap_owner'
    ).length,
    databaseBatches: batchCount,
    exclusionsNoOp: plan.exclusions.length,
    documentDeletes: false,
    preconditions: 'passed',
  }
}

function sortedOperationGroups(preflight) {
  const groups = new Map()
  for (const operation of preflight.operations) {
    const key = databaseKey(operation.target)
    const group = groups.get(key) || { key, db: operation.db, operations: [] }
    group.operations.push(operation)
    groups.set(key, group)
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      operations: group.operations.sort((left, right) =>
        remediationTargetKey(left.target).localeCompare(
          remediationTargetKey(right.target)
        )
      ),
    }))
    .sort((left, right) => left.key.localeCompare(right.key))
}

function firestoreErrorCode(error) {
  const code = error?.code
  if (code === 5) return 'NOT_FOUND'
  if (code === 9) return 'FAILED_PRECONDITION'
  return Number.isInteger(code) ? `GRPC_${code}` : 'UNKNOWN'
}

async function collectExecutionIdentities(preflight, pool) {
  const identities = []
  for (const group of sortedOperationGroups(preflight)) {
    const target = group.operations[0].target
    const credential = await pool.credentialFor(target)
    identities.push({
      target: {
        firebase_project_id: target.firebase_project_id,
        database_id: target.database_id,
      },
      identity: { ...credential.identity },
      write_assurance: 'conditional_apply_batch_only',
      dry_run_mutation_calls: false,
    })
  }
  return identities
}

const WRITE_CAPABILITY_PERMISSIONS = Object.freeze([
  'datastore.entities.create',
  'datastore.entities.update',
])

async function assertWriteCapabilities(preflight, pool) {
  const checks = []
  for (const group of sortedOperationGroups(preflight)) {
    const target = group.operations[0].target
    const credential = await pool.credentialFor(target)
    const collection = group.db.collection(
      'fireux-remediation-capability-checks'
    )
    const createRef = collection.doc(randomUUID())
    const updateRef = collection.doc(randomUUID())
    const before = await group.db.getAll(createRef, updateRef)
    if (before.some((snapshot) => snapshot.exists)) {
      throw new Error(`Capability-check reference collision for ${group.key}.`)
    }

    const access = await credential.credential.getAccessToken()
    const token = text(access?.access_token)
    if (!token) {
      throw new Error(`Capability check has no access token for ${group.key}.`)
    }
    const documentName = (ref) =>
      `projects/${target.firebase_project_id}/databases/${target.database_id}/documents/${ref.path}`
    const endpoint =
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(target.firebase_project_id)}` +
      `/databases/${encodeURIComponent(target.database_id)}/documents:commit`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: documentName(createRef),
              fields: { capability_check: { booleanValue: true } },
            },
            currentDocument: { exists: false },
          },
          {
            update: {
              name: documentName(updateRef),
              fields: { capability_check: { booleanValue: true } },
            },
            updateMask: { fieldPaths: ['capability_check'] },
            currentDocument: { exists: true },
          },
        ],
      }),
    })

    let responseBody = {}
    try {
      responseBody = record(await response.json())
    } catch {
      // The status check below rejects unknown or non-JSON responses.
    }
    const rejectionStatus = text(record(responseBody.error).status)
    if (
      response.ok ||
      !['FAILED_PRECONDITION', 'NOT_FOUND'].includes(rejectionStatus)
    ) {
      throw new Error(
        `Write capability assurance failed for ${group.key}: HTTP ${response.status} ${rejectionStatus || 'UNKNOWN'}; refs=${createRef.path},${updateRef.path}.`
      )
    }

    const after = await group.db.getAll(createRef, updateRef)
    if (after.some((snapshot) => snapshot.exists)) {
      throw new Error(
        `Write capability check left unexpected state in ${group.key}; refs=${createRef.path},${updateRef.path}.`
      )
    }
    checks.push({
      target: {
        firebase_project_id: target.firebase_project_id,
        database_id: target.database_id,
      },
      identity: { ...credential.identity },
      required_permissions: [...WRITE_CAPABILITY_PERMISSIONS],
      assurance: 'atomic_rest_create_plus_update_requires_existing',
      rejection_status: rejectionStatus,
      state_before: 'absent',
      state_after: 'absent',
    })
  }
  return checks
}

async function fsyncDirectory(directory) {
  const handle = await open(directory, 'r')
  try {
    await handle.sync()
  } finally {
    await handle.close()
  }
}

function artifactSource(value) {
  assertCredentialFreeBackup(value)
  return `${JSON.stringify(value, null, 2)}\n`
}

function assertAuthorityHashesUnchanged(expected, actual) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      'An authoritative remediation input changed after preflight.'
    )
  }
}

async function writeAtomicJournal(journalPath, value) {
  const directory = path.dirname(journalPath)
  const temporaryPath = path.join(
    directory,
    `.${path.basename(journalPath)}.${process.pid}.${randomUUID()}.tmp`
  )
  const source = artifactSource(value)
  const handle = await open(temporaryPath, 'wx', 0o600)
  let closed = false
  let renamed = false
  try {
    await handle.writeFile(source, 'utf8')
    await handle.sync()
    await handle.close()
    closed = true
    await rename(temporaryPath, journalPath)
    renamed = true
    await chmod(journalPath, 0o600)
    await fsyncDirectory(directory)
  } finally {
    if (!closed) await handle.close().catch(() => {})
    if (!renamed) await unlink(temporaryPath).catch(() => {})
  }
}

async function writeBackup({
  backupDir,
  reportHash,
  preflight,
  authoritativeInputHashes,
  executionIdentities,
  writeCapabilityChecks,
}) {
  const now = new Date()
  const backup = buildRemediationPreimageBackup({
    createdAt: now.toISOString(),
    reconciliationSha256: reportHash,
    operations: preflight.operations,
    readPreconditions: preflight.readPreconditions,
    authoritativeInputHashes,
    executionIdentities,
    writeCapabilityChecks,
  })
  assertCredentialFreeBackup(backup)

  await mkdir(backupDir, { recursive: true, mode: 0o700 })
  await chmod(backupDir, 0o700)
  const stamp = now.toISOString().replaceAll(/[:.]/g, '-')
  const backupPath = path.join(
    backupDir,
    `platform-directory-remediation-${stamp}.json`
  )
  const source = artifactSource(backup)
  const handle = await open(backupPath, 'wx', 0o600)
  try {
    await handle.writeFile(source, 'utf8')
    await handle.sync()
  } finally {
    await handle.close()
  }
  await chmod(backupPath, 0o600)
  await fsyncDirectory(backupDir)

  return {
    path: backupPath,
    sha256: createHash('sha256').update(source).digest('hex'),
    createdAt: now.toISOString(),
    stamp,
  }
}

function journalOperation(operation) {
  return {
    entity_kind: operation.entityKind,
    entity_id: operation.entityId,
    resolution: operation.resolution,
    target: { ...operation.target },
    expected_before_public_hashes: [
      ...(operation.expectedBeforePublicHashes || []),
    ],
    expected_post_public_hash: operation.expectedPostPublicHash,
  }
}

async function createProgressJournal({
  backupDir,
  backup,
  reportHash,
  preflight,
  authoritativeInputHashes,
  executionIdentities,
  writeCapabilityChecks,
}) {
  const journalPath = path.join(
    backupDir,
    `platform-directory-remediation-${backup.stamp}.journal.json`
  )
  const now = new Date().toISOString()
  const journal = {
    contractVersion: PLATFORM_DIRECTORY_REMEDIATION_JOURNAL_VERSION,
    createdAt: now,
    updatedAt: now,
    status: 'prepared',
    reconciliationSha256: reportHash,
    artifactPaths: {
      backup: path.relative(repoRoot, backup.path),
      journal: path.relative(repoRoot, journalPath),
    },
    backupSha256: backup.sha256,
    policy: {
      documentDeletes: false,
      publicPayloadsIncluded: false,
      secretMaterialIncluded: false,
      batchOrder: 'firebase_project_id/database_id',
    },
    authoritativeInputHashes: authoritativeInputHashes.map((input) => ({
      ...input,
    })),
    executionIdentities: executionIdentities.map((entry) => ({
      ...entry,
      target: { ...entry.target },
      identity: { ...entry.identity },
    })),
    writeCapabilityChecks: writeCapabilityChecks.map((check) => ({
      ...check,
      target: { ...check.target },
      identity: { ...check.identity },
      required_permissions: [...check.required_permissions],
    })),
    batches: sortedOperationGroups(preflight).map((group) => ({
      database: group.key,
      status: 'pending',
      updatedAt: now,
      verificationClassification: '',
      commitErrorCode: '',
      operations: group.operations.map(journalOperation),
      verification: [],
    })),
    finalVerification: { status: 'pending', verifiedAt: '' },
    failure: null,
  }
  await writeAtomicJournal(journalPath, journal)
  return { path: journalPath, value: journal }
}

async function persistJournal(store) {
  store.value.updatedAt = new Date().toISOString()
  await writeAtomicJournal(store.path, store.value)
}

function journalBatch(store, database) {
  const matches = store.value.batches.filter(
    (batch) => batch.database === database
  )
  if (matches.length !== 1) {
    throw new Error(`Journal batch is not unique: ${database}.`)
  }
  return matches[0]
}

function verifyOperationPost(operation, snapshot) {
  return operation.resolution === 'repair_relation'
    ? verifyRepairDocument({
        target: operation.target,
        entityId: operation.entityId,
        expectedProjectId: operation.expectedProjectId,
        expectedDatabaseId: operation.expectedDatabaseId,
        expectedPostPublicHash: operation.expectedPostPublicHash,
        exists: snapshot.exists,
        data: snapshot.data(),
      })
    : verifyBootstrapDocument({
        target: operation.target,
        decision: operation.decision,
        expectedPostPublicHash: operation.expectedPostPublicHash,
        expectedCreatorAppId: operation.expectedCreatorAppId,
        appCount:
          operation.entityKind === 'ecosystem'
            ? operation.reportRow.derivedAppCount
            : 0,
        exists: snapshot.exists,
        data: snapshot.data(),
      })
}

function operationMatchesPreState(operation, snapshot) {
  if (operation.resolution === 'bootstrap_owner') return !snapshot.exists
  try {
    assertRepairDocumentPrecondition({
      decision: operation.decision,
      repairTarget: operation.repairTarget,
      exists: snapshot.exists,
      data: snapshot.data(),
    })
    return true
  } catch {
    return false
  }
}

async function classifyBatchState(group) {
  let snapshots
  try {
    snapshots = await group.db.getAll(
      ...group.operations.map((operation) => operation.ref)
    )
  } catch {
    return {
      classification: 'ambiguous',
      verification: group.operations.map((operation) => ({
        target: { ...operation.target },
        state: 'unreadable',
      })),
    }
  }

  const verification = group.operations.map((operation, index) => {
    const snapshot = snapshots[index]
    const pre = operationMatchesPreState(operation, snapshot)
    let post = false
    let publicHash = ''
    try {
      const checked = verifyOperationPost(operation, snapshot)
      post = true
      publicHash = checked.public_hash
    } catch {
      // State is recorded as pre or ambiguous below without error payloads.
    }
    return {
      target: { ...operation.target },
      state: pre && !post ? 'pre' : post && !pre ? 'post' : 'ambiguous',
      public_hash: publicHash,
    }
  })
  const states = verification.map((result) => result.state)
  return {
    classification: states.every((state) => state === 'pre')
      ? 'all-pre'
      : states.every((state) => state === 'post')
        ? 'all-post'
        : 'ambiguous',
    verification,
  }
}

async function failJournal(store, options) {
  store.value.status = 'failed'
  store.value.failure = {
    phase: options.phase,
    database: options.database || '',
    code: options.code || 'UNKNOWN',
    failedAt: new Date().toISOString(),
  }
  await persistJournal(store)
}

async function applyOperations(preflight, journalStore, options = {}) {
  const groups = sortedOperationGroups(preflight)

  const completed = []
  journalStore.value.status = 'applying'
  await persistJournal(journalStore)

  for (const group of groups) {
    const key = group.key
    const progress = journalBatch(journalStore, key)
    try {
      if (typeof options.beforeGroupCommit === 'function') {
        await options.beforeGroupCommit(group)
      }
    } catch (error) {
      const classified = await classifyBatchState(group)
      progress.verificationClassification = classified.classification
      progress.verification = classified.verification
      progress.status =
        classified.classification === 'all-pre'
          ? 'verified_not_applied'
          : 'ambiguous'
      progress.updatedAt = new Date().toISOString()
      await persistJournal(journalStore)
      await failJournal(journalStore, {
        phase: 'precommit_revalidation',
        database: key,
        code: 'PRECOMMIT_REVALIDATION_FAILED',
      })
      throw error
    }

    progress.status = 'committing'
    progress.updatedAt = new Date().toISOString()
    await persistJournal(journalStore)

    const batch = group.db.batch()
    for (const operation of group.operations) {
      if (operation.resolution === 'repair_relation') {
        batch.update(
          operation.ref,
          { ecosystem_id: FieldValue.delete() },
          { lastUpdateTime: operation.lastUpdateTime }
        )
      } else if (operation.resolution === 'bootstrap_owner') {
        batch.create(operation.ref, operation.payload)
      } else {
        throw new Error(`Unsupported write resolution: ${operation.resolution}`)
      }
    }

    let commitError
    try {
      await batch.commit()
    } catch (error) {
      commitError = error
    }

    const classified = await classifyBatchState(group)
    progress.verificationClassification = classified.classification
    progress.verification = classified.verification
    progress.commitErrorCode = commitError
      ? firestoreErrorCode(commitError) || 'UNKNOWN'
      : ''
    progress.updatedAt = new Date().toISOString()
    progress.status =
      classified.classification === 'all-post'
        ? 'verified_applied'
        : classified.classification === 'all-pre'
          ? 'verified_not_applied'
          : 'ambiguous'
    await persistJournal(journalStore)

    if (classified.classification === 'all-post' && !commitError) {
      completed.push(key)
      continue
    }

    await failJournal(journalStore, {
      phase: commitError ? 'batch_commit' : 'batch_verification',
      database: key,
      code: progress.commitErrorCode || progress.status,
    })
    if (commitError) {
      throw new Error(
        `Write batch failed for ${key} after completed batches [${completed.join(', ') || 'none'}]: ${progress.commitErrorCode}`
      )
    }
    throw new Error(
      `Write batch verification failed for ${key} after completed batches [${completed.join(', ') || 'none'}]: ${classified.classification}`
    )
  }

  return completed
}

async function verifyWrites(preflight) {
  const results = await Promise.all(
    preflight.operations.map(async (operation) => {
      const snapshot = await operation.ref.get()
      const checked =
        operation.resolution === 'repair_relation'
          ? verifyRepairDocument({
              target: operation.target,
              entityId: operation.entityId,
              expectedProjectId: operation.expectedProjectId,
              expectedDatabaseId: operation.expectedDatabaseId,
              expectedPostPublicHash: operation.expectedPostPublicHash,
              exists: snapshot.exists,
              data: snapshot.data(),
            })
          : verifyBootstrapDocument({
              target: operation.target,
              decision: operation.decision,
              expectedPostPublicHash: operation.expectedPostPublicHash,
              expectedCreatorAppId: operation.expectedCreatorAppId,
              appCount:
                operation.entityKind === 'ecosystem'
                  ? operation.reportRow.derivedAppCount
                  : 0,
              exists: snapshot.exists,
              data: snapshot.data(),
            })
      return {
        entity_kind: operation.entityKind,
        entity_id: operation.entityId,
        target: operation.target,
        status: 'passed',
        public_hash: checked.public_hash,
      }
    })
  )
  await verifyPlatformReadPreconditions(preflight)
  return results.sort((left, right) =>
    remediationTargetKey(left.target).localeCompare(
      remediationTargetKey(right.target)
    )
  )
}

async function main() {
  const args = parseStrictArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }

  const apply = args.apply === true
  if (
    !apply &&
    (args.confirm || args['expect-report-sha256'] || args['backup-dir'])
  ) {
    throw new Error(
      '--confirm, --expect-report-sha256, and --backup-dir are apply-only options.'
    )
  }

  const reportPath = resolveRepoFile(
    args.report,
    'temp/platform-directory-reconciliation.json',
    'Report path'
  )
  const reportSource = await readFile(reportPath, 'utf8')
  let report
  try {
    report = JSON.parse(reportSource)
  } catch {
    throw new Error('Reconciliation report is not valid JSON.')
  }
  const reportHash = reportSha256(reportSource)
  assertLockedReconciliationHash(reportHash)
  if (apply) {
    assertApplyConfirmation({
      expectedHash: args['expect-report-sha256'],
      confirmation: args.confirm,
    })
  }

  const plan = buildPlatformDirectoryRemediationPlan(report, {
    generatedAt: new Date().toISOString(),
    sourceReportHash: reportHash,
  })
  const authoritySnapshot = await readValidatedRemediationSources({
    repoRoot,
    plan,
  })
  const { sources, authoritativeInputHashes } = authoritySnapshot
  const catalog = assertStandardTargetCatalog(
    report,
    uniqueDatabaseTargets(plan)
  )
  const pool = new FirebaseTargetPool({ args, catalog })

  try {
    const preflight = await buildRemotePreflight({
      report,
      plan,
      sources,
      pool,
    })
    const summary = safePreflightSummary(preflight, plan)
    const executionIdentities = await collectExecutionIdentities(
      preflight,
      pool
    )
    // Exercise the exact redacted backup projection in dry-run as well as
    // apply mode; only apply mode persists it to disk.
    buildRemediationPreimageBackup({
      createdAt: new Date().toISOString(),
      reconciliationSha256: reportHash,
      operations: preflight.operations,
      readPreconditions: preflight.readPreconditions,
      authoritativeInputHashes,
      executionIdentities,
    })

    if (!apply) {
      console.log(
        JSON.stringify(
          {
            contractVersion: PLATFORM_DIRECTORY_REMEDIATION_EXECUTION_VERSION,
            mode: 'dry-run',
            remoteReads: true,
            remoteWrites: false,
            executionReady: false,
            reconciliationSha256: reportHash,
            summary,
            authoritativeInputHashes,
            executionIdentities,
            writeAuthority:
              'Dry-run performs no mutation call; apply authority is established only by each journaled conditional batch commit.',
            payloadAssumptions: PLATFORM_DIRECTORY_BOOTSTRAP_ASSUMPTIONS,
            applyGate: {
              expectReportSha256: LOCKED_RECONCILIATION_SHA256,
              confirmation: PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION,
            },
          },
          null,
          2
        )
      )
      return
    }

    // Firestore exposes no database-level testIamPermissions method. Exercise
    // create and update authorization atomically: the second write requires a
    // random absent document to exist, so the request must fail as a unit and
    // both references must remain absent. This runs only after the apply gate.
    const writeCapabilityChecks = await assertWriteCapabilities(preflight, pool)

    // Recheck cross-database bootstrap seeds immediately before the backup and
    // first write. Write targets themselves are protected again at commit by
    // update-time or create-only existence preconditions.
    await verifyPlatformReadPreconditions(preflight)
    const backupDir = resolveRepoDirectory(
      args['backup-dir'],
      'temp/platform-directory-remediation-backups',
      'Backup directory'
    )
    const backup = await writeBackup({
      backupDir,
      reportHash,
      preflight,
      authoritativeInputHashes,
      executionIdentities,
      writeCapabilityChecks,
    })
    const journal = await createProgressJournal({
      backupDir,
      backup,
      reportHash,
      preflight,
      authoritativeInputHashes,
      executionIdentities,
      writeCapabilityChecks,
    })
    console.error(
      `[directory-remediation] prepared backup=${path.relative(repoRoot, backup.path)} journal=${path.relative(repoRoot, journal.path)}`
    )

    try {
      const beforeWriteInputHashes = await hashRemediationAuthorityInputs({
        repoRoot,
        authoritativeInputHashes,
      })
      assertAuthorityHashesUnchanged(
        authoritativeInputHashes,
        beforeWriteInputHashes
      )
    } catch (error) {
      await failJournal(journal, {
        phase: 'authoritative_input_recheck',
        code: 'AUTHORITY_INPUT_CHANGED',
      })
      throw error
    }

    const recheckAuthorityInputs = async () => {
      const currentInputHashes = await hashRemediationAuthorityInputs({
        repoRoot,
        authoritativeInputHashes,
      })
      assertAuthorityHashesUnchanged(
        authoritativeInputHashes,
        currentInputHashes
      )
    }
    const completedBatches = await applyOperations(preflight, journal, {
      beforeGroupCommit: async (group) => {
        await recheckAuthorityInputs()
        await verifyReadPreconditions(
          group.operations
            .map((operation) => operation.readPrecondition)
            .filter(Boolean)
        )
      },
    })
    let verification
    try {
      verification = await verifyWrites(preflight)
      journal.value.finalVerification = {
        status: 'passed',
        verifiedAt: new Date().toISOString(),
        operationCount: verification.length,
      }
      journal.value.status = 'complete'
      journal.value.failure = null
      await persistJournal(journal)
    } catch (error) {
      if (journal.value.status !== 'failed') {
        await failJournal(journal, {
          phase: 'final_verification',
          code: firestoreErrorCode(error) || 'FAILED',
        })
      }
      throw error
    }

    console.log(
      JSON.stringify(
        {
          contractVersion: PLATFORM_DIRECTORY_REMEDIATION_EXECUTION_VERSION,
          mode: 'apply',
          remoteReads: true,
          remoteWrites: true,
          documentDeletes: false,
          reconciliationSha256: reportHash,
          backup: {
            path: path.relative(repoRoot, backup.path),
            sha256: backup.sha256,
          },
          journal: {
            path: path.relative(repoRoot, journal.path),
            status: journal.value.status,
          },
          summary,
          writeCapabilityChecks,
          completedBatches,
          verification,
        },
        null,
        2
      )
    )
  } finally {
    await pool.close()
  }
}

main().catch((error) => {
  console.error(
    `[directory-remediation] ${
      error instanceof Error ? error.message : String(error)
    }`
  )
  process.exitCode = 1
})
