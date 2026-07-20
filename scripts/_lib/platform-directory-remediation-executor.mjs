// @fireux-script
// last_used: 2026-07-20
// usage_note: fail-closed source, precondition, backup, and verification helpers for the one-time directory authority remediation.
// Concurrent edit — 2026-07-20 12:15 CEST — Directory Remediation Journal: bind parsed authority values to their exact source buffers.
// Concurrent edit — 2026-07-20 12:27 CEST — Directory Live Pass: close source races and record state-free capability assurance.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import {
  appRelationIssues,
  ecosystemRelationIssues,
  projectAppDirectoryEntry,
  projectEcosystemDirectoryEntry,
  publicProjectionHash,
} from './platform-directory-reconciliation.mjs'

export const PLATFORM_DIRECTORY_REMEDIATION_EXECUTION_VERSION =
  'platform-directory-remediation-execution/v1'
export const PLATFORM_DIRECTORY_REMEDIATION_BACKUP_VERSION =
  'platform-directory-remediation-backup/v2'
export const PLATFORM_DIRECTORY_REMEDIATION_JOURNAL_VERSION =
  'platform-directory-remediation-journal/v1'
export const LOCKED_RECONCILIATION_SHA256 =
  'b0b23a4e4123b0bec1bec0fcbc7a39c0ca19df7c09f281434be14ba2c212b005'
export const PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION =
  'APPLY_PLATFORM_DIRECTORY_REMEDIATION_b0b23a4e4123'

export const PLATFORM_DIRECTORY_BOOTSTRAP_ASSUMPTIONS = Object.freeze({
  app: 'Use current app ensure fields from project nuxt.config.ts, fixed /img/app logo and thumbnail paths, zero users, no runtime-only site URL, and timestamp-only migration stamps.',
  ecosystem:
    'Use current Ecosystem create relations and App stamps, seeded only from the allowlisted legacy platform public projection after its locked hash passes.',
  deletes:
    'No document deletes. Relation repair removes only the stale ecosystem_id field from direct Project App documents.',
})

const text = (value) => String(value ?? '').trim()

const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const integer = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0
}

export const remediationEntityKey = (value) =>
  `${text(value?.entity_kind)}/${text(value?.entity_id)}`

export const remediationTargetKey = (target) =>
  [
    text(target?.firebase_project_id),
    text(target?.database_id),
    text(target?.document_path),
  ].join('/')

const databaseTargetKey = (target) =>
  `${text(target?.firebase_project_id)}/${text(target?.database_id)}`

export function assertLockedReconciliationHash(actualHash) {
  const actual = text(actualHash)
  if (actual !== LOCKED_RECONCILIATION_SHA256) {
    throw new Error(
      `Reconciliation SHA-256 changed: expected ${LOCKED_RECONCILIATION_SHA256}, received ${actual || '(empty)'}.`
    )
  }
}

export function assertApplyConfirmation(options = {}) {
  const expectedHash = text(options.expectedHash)
  const confirmation = text(options.confirmation)
  assertLockedReconciliationHash(expectedHash)
  if (confirmation !== PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION) {
    throw new Error(
      `Apply requires --confirm ${PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION}.`
    )
  }
}

function repoFile(repoRoot, relativePath) {
  const root = path.resolve(repoRoot)
  const resolved = path.resolve(root, text(relativePath))
  const relative = path.relative(root, resolved)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Authority input must stay below the repository root: ${relativePath}`
    )
  }
  return resolved
}

function literal(source, key) {
  const match = source.match(new RegExp(`\\b${key}\\s*:\\s*(['"])([^'"]+)\\1`))
  return text(match?.[2])
}

function createAuthorityReader(repoRoot) {
  const cache = new Map()
  const read = (relativePath) => {
    const key = text(relativePath)
    if (!key) throw new Error('Authority input path is empty.')
    if (!cache.has(key)) {
      cache.set(key, readFile(repoFile(repoRoot, key)))
    }
    return cache.get(key)
  }

  return {
    read,
    async hashes() {
      return Promise.all(
        [...cache.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(async ([relativePath, sourcePromise]) => ({
            path: relativePath,
            sha256: createHash('sha256')
              .update(await sourcePromise)
              .digest('hex'),
          }))
      )
    },
  }
}

async function readAppConfig(authorityReader, relativePath) {
  const source = (await authorityReader.read(relativePath)).toString('utf8')
  return {
    path: relativePath,
    ecosystem: literal(source, 'ecosystem'),
    projectId: literal(source, 'projectId'),
    ecosystemId: literal(source, 'ecosystemId'),
    databaseId: literal(source, 'databaseId'),
    id: literal(source, 'id'),
    name: literal(source, 'name'),
    shortName: literal(source, 'shortName'),
    role: literal(source, 'role'),
  }
}

async function readEcosystemBinding(authorityReader, name) {
  const packagePath = `packages/ecosystem/fireux-${name}`
  const configPath = `${packagePath}/src/config/firebase/ecosystem.config.ts`
  const configSource = (await authorityReader.read(configPath)).toString('utf8')
  const firebasercPath = `${packagePath}/.firebaserc`
  const firebaserc = JSON.parse(
    (await authorityReader.read(firebasercPath)).toString('utf8')
  )
  const firebaseProjectId = literal(configSource, 'projectId')
  const databaseId = literal(configSource, 'databaseId')
  const firebasercProjectId = text(firebaserc?.projects?.default)

  if (!firebaseProjectId || !databaseId) {
    throw new Error(`Incomplete Firebase binding for ecosystem ${name}.`)
  }
  if (firebaseProjectId !== firebasercProjectId) {
    throw new Error(
      `${name} Firebase binding differs between ecosystem.config.ts and .firebaserc.`
    )
  }

  return {
    name,
    firebaseProjectId,
    databaseId,
    configPath,
    firebasercPath,
  }
}

function assertSourceValue(key, label, actual, expected) {
  if (text(actual) !== text(expected)) {
    throw new Error(
      `${label} changed for ${key}: expected ${JSON.stringify(text(expected))}, received ${JSON.stringify(text(actual))}.`
    )
  }
}

/**
 * Re-reads only source-controlled config. Runtime .env files are deliberately
 * excluded: migration payloads must never ingest local credentials or secrets.
 */
export async function readValidatedRemediationSources({ repoRoot, plan }) {
  const authorityReader = createAuthorityReader(repoRoot)
  const result = new Map()
  const actionable = plan.decisions.filter(
    (decision) => decision.resolution !== 'exclude_from_backfill'
  )

  await Promise.all(
    plan.decisions.flatMap((decision) =>
      (decision.authoritative_inputs || []).map((relativePath) =>
        authorityReader.read(relativePath)
      )
    )
  )

  for (const decision of actionable) {
    const key = remediationEntityKey(decision)
    const configPath = decision.authoritative_inputs.find(
      (input) =>
        input.startsWith('projects/') && input.endsWith('/nuxt.config.ts')
    )
    if (!configPath) {
      throw new Error(`Project App config authority is missing for ${key}.`)
    }

    const config = await readAppConfig(authorityReader, configPath)
    const binding = await readEcosystemBinding(
      authorityReader,
      config.ecosystem
    )
    const expected = decision.precondition.source
    const resolvedDatabaseId = config.databaseId || binding.databaseId
    const expectedEcosystemId =
      decision.entity_kind === 'ecosystem'
        ? decision.entity_id
        : text(expected.ecosystem_id)

    assertSourceValue(key, 'project_id', config.projectId, expected.project_id)
    assertSourceValue(
      key,
      'ecosystem_id',
      config.ecosystemId,
      expectedEcosystemId
    )
    assertSourceValue(
      key,
      'Firebase project',
      binding.firebaseProjectId,
      expected.firebase_project_id
    )
    assertSourceValue(key, 'database', resolvedDatabaseId, expected.database_id)

    if (decision.entity_kind === 'app') {
      assertSourceValue(key, 'App id', config.id, decision.entity_id)
    } else {
      if (config.role !== 'global') {
        throw new Error(
          `Ecosystem bootstrap source must be a global App: ${key}.`
        )
      }
    }
    if (!config.id || !config.name || !config.shortName || !config.role) {
      throw new Error(`Incomplete App bootstrap config for ${key}.`)
    }

    result.set(key, { config, binding })
  }

  return {
    sources: result,
    authoritativeInputHashes: await authorityReader.hashes(),
  }
}

/**
 * Re-hash exactly the files whose bytes were parsed into remediation payloads.
 * File contents never leave this function.
 */
export async function hashRemediationAuthorityInputs({
  repoRoot,
  authoritativeInputHashes,
}) {
  return Promise.all(
    (authoritativeInputHashes || []).map(async (input) => {
      const relativePath = text(input.path)
      const source = await readFile(repoFile(repoRoot, relativePath))
      return {
        path: relativePath,
        sha256: createHash('sha256').update(source).digest('hex'),
      }
    })
  )
}

export function assertStandardTargetCatalog(reportValue, targets) {
  const report = record(reportValue)
  const rows = Array.isArray(report.targets) ? report.targets : []
  const catalog = new Map()

  for (const target of targets) {
    const key = databaseTargetKey(target)
    if (catalog.has(key)) continue
    const matches = rows.filter((row) => {
      const firebase = record(row.firebase)
      return (
        text(firebase.projectId) === text(target.firebase_project_id) &&
        text(firebase.databaseId) === text(target.database_id)
      )
    })
    if (matches.length !== 1) {
      throw new Error(
        `Expected one reconciliation target for ${key}; received ${matches.length}.`
      )
    }

    const row = matches[0]
    const firebase = record(row.firebase)
    if (
      text(firebase.edition).toLowerCase() !== 'standard' ||
      text(firebase.metadataStatus) !== 'ready' ||
      text(firebase.readStatus) !== 'ready'
    ) {
      throw new Error(
        `Target ${key} is not a ready Standard-edition reconciliation source.`
      )
    }

    catalog.set(key, {
      firebase_project_id: text(firebase.projectId),
      database_id: text(firebase.databaseId),
      scope:
        (Array.isArray(row.ecosystemBindings) &&
          text(row.ecosystemBindings[0])) ||
        text(firebase.projectId),
    })
  }

  return catalog
}

export function directoryReportRow(reportValue, entityKind, entityId) {
  const report = record(reportValue)
  const rows = entityKind === 'app' ? report.apps : report.ecosystems
  const matches = Array.isArray(rows)
    ? rows.filter((row) => text(row.id) === text(entityId))
    : []
  if (matches.length !== 1) {
    throw new Error(
      `Expected one ${entityKind} reconciliation row for ${entityId}; received ${matches.length}.`
    )
  }
  return matches[0]
}

function expectedHashForRole(decision, role) {
  if (role === 'canonical_owner') {
    return text(decision.precondition.owner_public_hash)
  }
  if (role === 'legacy_platform') {
    return text(decision.precondition.platform_public_hash)
  }
  throw new Error(`Unknown repair target role: ${role}`)
}

export function assertRepairDocumentPrecondition(options) {
  const decision = options.decision
  const repairTarget = options.repairTarget
  const key = remediationTargetKey(repairTarget.target)
  const data = record(options.data)

  if (options.exists !== true) {
    throw new Error(`Relation repair target no longer exists: ${key}.`)
  }
  if (decision.resolution !== 'repair_relation') {
    throw new Error(`Non-repair decision supplied for ${key}.`)
  }

  const relationIssues = appRelationIssues(data, {
    projectId: decision.precondition.source.project_id,
    ecosystemId: '',
  })
  if (!isDeepStrictEqual(relationIssues, ['ecosystem_id'])) {
    throw new Error(`Live relationship precondition changed for ${key}.`)
  }
  if (
    text(data.database_id) !== text(decision.precondition.source.database_id) ||
    !record(data.created).at ||
    !record(data.updated).at
  ) {
    throw new Error(`Live App storage fields changed for ${key}.`)
  }

  const currentPublicHash = publicProjectionHash(
    projectAppDirectoryEntry(data, decision.entity_id)
  )
  for (const role of repairTarget.target_roles) {
    const expectedHash = expectedHashForRole(decision, role)
    if (currentPublicHash !== expectedHash) {
      throw new Error(
        `Live public projection hash changed for ${key} (${role}).`
      )
    }
  }

  const afterData = { ...data }
  delete afterData.ecosystem_id
  const expectedPostPublicHash = publicProjectionHash(
    projectAppDirectoryEntry(afterData, decision.entity_id)
  )

  return {
    current_public_hash: currentPublicHash,
    expected_post_public_hash: expectedPostPublicHash,
    before_fields: {
      project_id: text(data.project_id),
      ecosystem_id: text(data.ecosystem_id),
    },
  }
}

export function assertBootstrapOwnerMissing(options) {
  const key = remediationTargetKey(options.target)
  if (options.exists === true) {
    throw new Error(`Canonical owner bootstrap target now exists: ${key}.`)
  }
}

function publicProjectionFor(kind, data, id, appCount) {
  return kind === 'app'
    ? projectAppDirectoryEntry(data, id)
    : projectEcosystemDirectoryEntry(data, id, appCount)
}

export function assertBootstrapPlatformPrecondition(options) {
  const decision = options.decision
  const row = options.reportRow
  const expectedExists = decision.precondition.platform_exists === true
  const actualExists = options.exists === true
  if (actualExists !== expectedExists) {
    throw new Error(
      `Legacy platform existence changed for ${remediationEntityKey(decision)}.`
    )
  }
  if (!expectedExists) return { publicEntry: null, publicHash: '' }

  const appCount =
    decision.entity_kind === 'ecosystem' ? integer(row.derivedAppCount) : 0
  const publicEntry = publicProjectionFor(
    decision.entity_kind,
    record(options.data),
    decision.entity_id,
    appCount
  )
  const publicHash = publicProjectionHash(publicEntry)
  if (publicHash !== text(decision.precondition.platform_public_hash)) {
    throw new Error(
      `Legacy platform public hash changed for ${remediationEntityKey(decision)}.`
    )
  }
  return { publicEntry, publicHash }
}

function timestamps(timestampFactory) {
  if (typeof timestampFactory !== 'function') {
    throw new Error('A server timestamp factory is required.')
  }
  return {
    createdAt: timestampFactory(),
    updatedAt: timestampFactory(),
  }
}

/** Final stored App payload after useFirestoreCreate strips the input id. */
export function buildAppOwnerBootstrapPayload(options) {
  const decision = options.decision
  const config = options.source?.config
  if (
    decision.entity_kind !== 'app' ||
    decision.resolution !== 'bootstrap_owner'
  ) {
    throw new Error('App bootstrap builder requires an App bootstrap decision.')
  }
  const stamp = timestamps(options.timestampFactory)
  const source = decision.precondition.source

  return {
    project_id: source.project_id,
    ecosystem_id: source.ecosystem_id,
    database_id: source.database_id,
    slug: decision.entity_id,
    status: 'active',
    app_name: config.name,
    app_short_name: config.shortName,
    role: config.role,
    media: {
      thumbnail_url: '/img/app/thumbnail.png',
      logo_url: '/img/app/logo.png',
    },
    derived: {
      user_count: 0,
    },
    created: {
      at: stamp.createdAt,
    },
    updated: {
      at: stamp.updatedAt,
    },
  }
}

export function buildEcosystemOwnerBootstrapPayload(options) {
  const decision = options.decision
  const config = options.source?.config
  const publicEntry = record(options.platformPublicEntry)
  if (
    decision.entity_kind !== 'ecosystem' ||
    decision.resolution !== 'bootstrap_owner'
  ) {
    throw new Error(
      'Ecosystem bootstrap builder requires an Ecosystem bootstrap decision.'
    )
  }
  if (
    text(publicEntry.id) !== decision.entity_id ||
    text(publicEntry.slug) !== decision.entity_id ||
    text(publicEntry.status) !== 'active' ||
    text(publicEntry.name) !== text(config.name)
  ) {
    throw new Error(
      `Legacy Ecosystem identity is not safe to seed for ${decision.entity_id}.`
    )
  }

  const stamp = timestamps(options.timestampFactory)
  return {
    id: decision.entity_id,
    project_id: decision.precondition.source.project_id,
    name: config.name,
    slug: decision.entity_id,
    description: text(publicEntry.description),
    image_url: text(publicEntry.image_url),
    website_url: text(publicEntry.website_url),
    status: 'active',
    created: {
      at: stamp.createdAt,
      by: config.id,
      app_id: config.id,
    },
    updated: {
      at: stamp.updatedAt,
      by: config.id,
    },
  }
}

export function expectedBootstrapPublicHash(options) {
  const appCount =
    options.decision.entity_kind === 'ecosystem'
      ? integer(options.reportRow.derivedAppCount)
      : 0
  return publicProjectionHash(
    publicProjectionFor(
      options.decision.entity_kind,
      options.payload,
      options.decision.entity_id,
      appCount
    )
  )
}

export function verifyRepairDocument(options) {
  const key = remediationTargetKey(options.target)
  const data = record(options.data)
  if (options.exists !== true) {
    throw new Error(`Repaired document is missing: ${key}.`)
  }
  if ('ecosystem_id' in data) {
    throw new Error(`Stale ecosystem_id remains after repair: ${key}.`)
  }
  if (text(data.project_id) !== text(options.expectedProjectId)) {
    throw new Error(`project_id changed during relation repair: ${key}.`)
  }
  if (
    text(data.database_id) !== text(options.expectedDatabaseId) ||
    !record(data.created).at ||
    !record(data.updated).at
  ) {
    throw new Error(
      `App storage fields changed during relation repair: ${key}.`
    )
  }
  const publicHash = publicProjectionHash(
    projectAppDirectoryEntry(data, options.entityId)
  )
  if (publicHash !== text(options.expectedPostPublicHash)) {
    throw new Error(`Post-write App public hash mismatch: ${key}.`)
  }
  return { public_hash: publicHash }
}

export function verifyBootstrapDocument(options) {
  const decision = options.decision
  const key = remediationTargetKey(options.target)
  const data = record(options.data)
  if (options.exists !== true) {
    throw new Error(`Bootstrapped canonical owner is missing: ${key}.`)
  }
  if (decision.entity_kind === 'app') {
    if ('id' in data) {
      throw new Error(
        `Bootstrapped App persisted a competing id field: ${key}.`
      )
    }
    const issues = appRelationIssues(data, {
      projectId: decision.precondition.source.project_id,
      ecosystemId: decision.precondition.source.ecosystem_id,
    })
    if (issues.length) {
      throw new Error(`Bootstrapped App relationship mismatch: ${key}.`)
    }
    if (
      text(data.database_id) !== text(decision.precondition.source.database_id)
    ) {
      throw new Error(`Bootstrapped App database_id mismatch: ${key}.`)
    }
    if (!record(data.created).at || !record(data.updated).at) {
      throw new Error(`Bootstrapped App migration stamps are missing: ${key}.`)
    }
  } else {
    if (text(data.id) !== decision.entity_id) {
      throw new Error(`Bootstrapped Ecosystem id mismatch: ${key}.`)
    }
    const issues = ecosystemRelationIssues(data, {
      projectId: decision.precondition.source.project_id,
    })
    if (issues.length) {
      throw new Error(`Bootstrapped Ecosystem relationship mismatch: ${key}.`)
    }
    const creatorAppId = text(options.expectedCreatorAppId)
    const created = record(data.created)
    const updated = record(data.updated)
    if (
      !created.at ||
      !updated.at ||
      !creatorAppId ||
      text(created.by) !== creatorAppId ||
      text(created.app_id) !== creatorAppId ||
      text(updated.by) !== creatorAppId
    ) {
      throw new Error(
        `Bootstrapped Ecosystem migration stamp mismatch: ${key}.`
      )
    }
  }

  const publicHash = publicProjectionHash(
    publicProjectionFor(
      decision.entity_kind,
      data,
      decision.entity_id,
      integer(options.appCount)
    )
  )
  if (publicHash !== text(options.expectedPostPublicHash)) {
    throw new Error(`Post-write owner public hash mismatch: ${key}.`)
  }
  return { public_hash: publicHash }
}

export function buildRemediationPreimageBackup(options) {
  const backup = {
    contractVersion: PLATFORM_DIRECTORY_REMEDIATION_BACKUP_VERSION,
    createdAt: text(options.createdAt),
    reconciliationSha256: text(options.reconciliationSha256),
    policy: {
      documentDeletes: false,
      publicPayloadsIncluded: false,
      secretMaterialIncluded: false,
      fieldRemovals: ['ecosystem_id'],
    },
    authoritativeInputHashes: (options.authoritativeInputHashes || []).map(
      (input) => ({
        path: text(input.path),
        sha256: text(input.sha256),
      })
    ),
    executionIdentities: (options.executionIdentities || []).map((entry) => ({
      target: { ...entry.target },
      identity: { ...record(entry.identity) },
      write_assurance: text(entry.write_assurance),
      dry_run_mutation_calls: entry.dry_run_mutation_calls === true,
    })),
    writeCapabilityChecks: (options.writeCapabilityChecks || []).map(
      (check) => ({
        target: { ...check.target },
        identity: { ...record(check.identity) },
        required_permissions: [...(check.required_permissions || [])],
        assurance: text(check.assurance),
        rejection_status: text(check.rejection_status),
        state_before: text(check.state_before),
        state_after: text(check.state_after),
      })
    ),
    writePreconditions: options.operations.map((operation) => ({
      entity_kind: operation.entityKind,
      entity_id: operation.entityId,
      resolution: operation.resolution,
      classification: operation.classification,
      target: { ...operation.target },
      exists: operation.exists,
      update_time: operation.updateTime || '',
      before_fields: operation.beforeFields
        ? { ...operation.beforeFields }
        : undefined,
      expected_before_public_hashes: [
        ...(operation.expectedBeforePublicHashes || []),
      ],
      expected_post_public_hash: text(operation.expectedPostPublicHash),
    })),
    readPreconditions: options.readPreconditions.map((precondition) => ({
      entity_kind: precondition.entityKind,
      entity_id: precondition.entityId,
      target: { ...precondition.target },
      exists: precondition.exists,
      expected_public_hash: precondition.expectedPublicHash || '',
    })),
  }
  assertCredentialFreeBackup(backup)
  return backup
}

export function assertCredentialFreeBackup(value) {
  const forbiddenKey =
    /(?:credential|password|private[_-]?key|api[_-]?key|access[_-]?token|refresh[_-]?token|authorization)/i
  const secretValue =
    /(?:-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{16,}|\bya29\.[A-Za-z0-9_-]+|\bAIza[A-Za-z0-9_-]{20,})/

  const visit = (entry, location = '$') => {
    if (typeof entry === 'string') {
      if (secretValue.test(entry)) {
        throw new Error(
          `Credential-like material rejected from backup at ${location}.`
        )
      }
      return
    }
    if (Array.isArray(entry)) {
      entry.forEach((child, index) => visit(child, `${location}[${index}]`))
      return
    }
    if (!entry || typeof entry !== 'object') return
    for (const [key, child] of Object.entries(entry)) {
      if (forbiddenKey.test(key)) {
        throw new Error(
          `Credential-like backup key rejected at ${location}.${key}.`
        )
      }
      visit(child, `${location}.${key}`)
    }
  }

  visit(value)
}
