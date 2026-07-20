#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: read-only App/Ecosystem owner-to-platform directory reconciliation.
// Concurrent edit — 2026-07-19 17:08 CEST — Directory Authority Cutover: classify owner conflicts, bounded reads, and derived App counts.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: refresh live remediation preconditions before any write.

import { execFile } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldPath, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import {
  PLATFORM_DIRECTORY_RECONCILIATION_VERSION,
  appRelationIssues,
  classifyExpectedDirectoryRecord,
  ecosystemRelationIssues,
  extractPlatformAppMetadata,
  projectAppDirectoryEntry,
  projectEcosystemDirectoryEntry,
  publicFieldDiffs,
  publicProjectionHash,
  summarizeDirectoryRows,
} from './_lib/platform-directory-reconciliation.mjs'

const execFileAsync = promisify(execFile)
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const args = parseArgs(process.argv.slice(2))
const includePublicValues = Boolean(args['include-public-values'])
const format = String(args.format || 'summary').trim()
const outputPath = path.resolve(
  repoRoot,
  String(args.out || 'temp/platform-directory-reconciliation.json').trim()
)
const text = (value) => String(value ?? '').trim()

if (args.help) {
  printUsage()
  process.exit(0)
}

if (!['summary', 'json'].includes(format)) {
  throw new Error('--format must be summary or json.')
}

const discoveredApps = await discoverProjectApps()
const selectedApps = discoveredApps
  .filter((app) =>
    args.ecosystem
      ? app.ecosystemBinding === text(args.ecosystem) ||
        app.ecosystemId === text(args.ecosystem)
      : true
  )
  .filter((app) => (args.app ? app.id === text(args.app) : true))

if (!selectedApps.length) {
  throw new Error('No concrete project Apps matched the requested scope.')
}

const ecosystemBindings = new Map()
for (const app of selectedApps) {
  if (!ecosystemBindings.has(app.ecosystemBinding)) {
    ecosystemBindings.set(
      app.ecosystemBinding,
      await readEcosystemBinding(app.ecosystemBinding)
    )
  }
}

if (!ecosystemBindings.has('fireux')) {
  ecosystemBindings.set('fireux', await readEcosystemBinding('fireux'))
}

const platformBinding = ecosystemBindings.get('fireux')
if (!platformBinding?.firebaseProjectId || !platformBinding.databaseId) {
  throw new Error('Could not resolve the FireUX platform project and database.')
}

const targetDefinitions = new Map()

function ensureTarget(binding, databaseId, usage) {
  const resolvedDatabaseId = text(databaseId)
  const key = `${binding.firebaseProjectId}/${resolvedDatabaseId}`
  const existing = targetDefinitions.get(key)
  const next =
    existing ||
    {
      key,
      ecosystemBindings: new Set(),
      firebaseProjectId: binding.firebaseProjectId,
      databaseId: resolvedDatabaseId,
      readApps: false,
      readEcosystems: false,
      platform: false,
    }

  next.ecosystemBindings.add(binding.name)
  next.readApps ||= usage.apps === true
  next.readEcosystems ||= usage.ecosystems === true
  next.platform ||= usage.platform === true
  targetDefinitions.set(key, next)
  return key
}

for (const app of selectedApps) {
  const binding = ecosystemBindings.get(app.ecosystemBinding)
  if (!binding) continue
  app.ownerDatabaseId = app.databaseId || binding.databaseId
  app.ownerTargetKey = ensureTarget(binding, app.ownerDatabaseId, { apps: true })
}

// One configured App id must resolve to one owner definition. Retain one report
// row when project configs conflict, but never choose an arbitrary owner or
// emit duplicate rows from the competing workspaces.
const configuredAppsById = new Map()
for (const app of selectedApps) {
  const definition = {
    workspace: app.workspace,
    ecosystemBinding: app.ecosystemBinding,
    projectId: app.projectId,
    ecosystemId: app.ecosystemId,
    databaseId: app.ownerDatabaseId,
    ownerTargetKey: app.ownerTargetKey,
  }
  const existing = configuredAppsById.get(app.id)
  if (!existing) {
    configuredAppsById.set(app.id, {
      ...app,
      ambiguous: false,
      configuredOwners: [definition],
    })
    continue
  }

  existing.configuredOwners.push(definition)
  const ownerDefinition = existing.configuredOwners[0]
  if (
    ownerDefinition.ecosystemBinding !== definition.ecosystemBinding ||
    ownerDefinition.projectId !== definition.projectId ||
    ownerDefinition.ecosystemId !== definition.ecosystemId ||
    ownerDefinition.databaseId !== definition.databaseId
  ) {
    existing.ambiguous = true
  }
}
selectedApps.splice(0, selectedApps.length, ...configuredAppsById.values())

const expectedEcosystems = new Map()
for (const app of selectedApps) {
  if (!app.ecosystemId) continue
  const binding = ecosystemBindings.get(app.ecosystemBinding)
  if (!binding) continue
  const existing = expectedEcosystems.get(app.ecosystemId)
  const targetKey = ensureTarget(binding, binding.databaseId, {
    apps: true,
    ecosystems: true,
  })

  if (
    existing &&
    (existing.projectId !== app.projectId || existing.ownerTargetKey !== targetKey)
  ) {
    existing.ambiguous = true
    continue
  }

  expectedEcosystems.set(app.ecosystemId, {
    id: app.ecosystemId,
    ecosystemBinding: app.ecosystemBinding,
    projectId: app.projectId,
    ownerTargetKey: targetKey,
    ambiguous: false,
  })
}

const platformTargetKey = ensureTarget(platformBinding, platformBinding.databaseId, {
  apps: true,
  ecosystems: true,
  platform: true,
})

const targets = [...targetDefinitions.values()]
const targetResults = new Map()
const adminApps = new Map()

async function adminAppFor(target) {
  if (adminApps.has(target.firebaseProjectId)) {
    return adminApps.get(target.firebaseProjectId)
  }

  const bindingName = [...target.ecosystemBindings][0] || target.firebaseProjectId
  const auth = await resolveFirebaseAdminCredential({
    args,
    scope: bindingName,
    projectId: target.firebaseProjectId,
  })
  const name = `directory-reconcile-${target.firebaseProjectId}`
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .slice(0, 100)
  const app = initializeApp(
    {
      credential: auth.credential,
      projectId: target.firebaseProjectId,
    },
    name
  )
  const result = { app, credentialSource: auth.source }
  adminApps.set(target.firebaseProjectId, result)
  return result
}

await Promise.all(
  targets.map(async (target) => {
    const metadata = await describeDatabase(target)
    let credentialSource = ''
    let readStatus = 'ready'
    let readError = ''
    let apps = new Map()
    let ecosystems = new Map()

    try {
      const admin = await adminAppFor(target)
      credentialSource = admin.credentialSource
      const db = getFirestore(admin.app, target.databaseId)
      ;[apps, ecosystems] = await Promise.all([
        target.readApps ? readCollectionBounded(db, 'apps') : new Map(),
        target.readEcosystems
          ? readCollectionBounded(db, 'ecosystems')
          : new Map(),
      ])
    } catch (error) {
      readStatus = 'blocked'
      readError = error instanceof Error ? error.message : String(error)
    }

    targetResults.set(target.key, {
      ...target,
      edition: metadata.edition,
      location: metadata.location,
      metadataStatus: metadata.status,
      metadataError: metadata.error,
      credentialSource,
      readStatus,
      readError,
      apps,
      ecosystems,
    })
  })
)

const platformResult = targetResults.get(platformTargetKey)
const appRows = []
const activeAppsByEcosystem = new Map()
const activeAppIdsByEcosystem = new Map()

for (const expected of selectedApps) {
  const ownerResult = targetResults.get(expected.ownerTargetKey)
  const owner = ownerResult?.apps.get(expected.id) || null
  const platform = platformResult?.apps.get(expected.id) || null
  const ownerPublic = owner
    ? projectAppDirectoryEntry(owner, expected.id)
    : null
  const platformPublic = platform
    ? projectAppDirectoryEntry(platform, expected.id)
    : null
  const diffs = publicFieldDiffs(ownerPublic, platformPublic)
  const relationIssues = [
    ...appRelationIssues(owner, expected).map((field) => `owner.${field}`),
    ...appRelationIssues(platform, expected).map(
      (field) => `platform.${field}`
    ),
  ]
  const classification = expected.ambiguous
    ? 'AMBIGUOUS'
    : classifyExpectedDirectoryRecord({
        ownerReadable: ownerResult?.readStatus === 'ready',
        platformReadable: platformResult?.readStatus === 'ready',
        owner,
        platform,
        ownerStatus: owner?.status,
        relationIssues,
        publicDiffs: diffs,
      })

  if (
    owner &&
    text(owner.status) === 'active' &&
    expected.ecosystemId &&
    text(owner.ecosystem_id) === expected.ecosystemId
  ) {
    activeAppsByEcosystem.set(
      expected.ecosystemId,
      (activeAppsByEcosystem.get(expected.ecosystemId) || 0) + 1
    )
    const activeIds = activeAppIdsByEcosystem.get(expected.ecosystemId) || []
    activeIds.push(expected.id)
    activeAppIdsByEcosystem.set(expected.ecosystemId, activeIds)
  }

  appRows.push({
    id: expected.id,
    expectedOwner: {
      workspace: expected.workspace,
      ecosystemBinding: expected.ecosystemBinding,
      firebaseProjectId:
        ecosystemBindings.get(expected.ecosystemBinding)?.firebaseProjectId ||
        '',
      databaseId: expected.ownerDatabaseId,
      projectId: expected.projectId,
      ecosystemId: expected.ecosystemId,
      ...(expected.ambiguous
        ? { configuredOwners: expected.configuredOwners }
        : {}),
    },
    ownerExists: Boolean(owner),
    platformExists: Boolean(platform),
    classification,
    relationIssues,
    publicFieldDiffs: diffs,
    ownerPublicHash: publicProjectionHash(ownerPublic),
    platformPublicHash: publicProjectionHash(platformPublic),
    platformMetadata: extractPlatformAppMetadata(platform),
    ...(includePublicValues
      ? { publicValues: { owner: ownerPublic, platform: platformPublic } }
      : {}),
  })
}

const activePlatformAppIdsByEcosystem = new Map()
for (const [id, app] of platformResult?.apps || []) {
  const ecosystemId = text(app.ecosystem_id)
  if (text(app.status) !== 'active' || !ecosystemId) continue
  const activeIds = activePlatformAppIdsByEcosystem.get(ecosystemId) || []
  activeIds.push(id)
  activePlatformAppIdsByEcosystem.set(ecosystemId, activeIds)
}

const ecosystemRows = []
for (const expected of expectedEcosystems.values()) {
  const ownerResult = targetResults.get(expected.ownerTargetKey)
  const owner = ownerResult?.ecosystems.get(expected.id) || null
  const platform = platformResult?.ecosystems.get(expected.id) || null
  const appCount = activeAppsByEcosystem.get(expected.id) || 0
  const derivedAppIds = [...(activeAppIdsByEcosystem.get(expected.id) || [])].sort()
  const platformDerivedAppIds = [
    ...(activePlatformAppIdsByEcosystem.get(expected.id) || []),
  ].sort()
  const derivedCountIssues =
    derivedAppIds.length === platformDerivedAppIds.length ? [] : ['app_count']
  const ownerPublic = owner
    ? projectEcosystemDirectoryEntry(owner, expected.id, appCount)
    : null
  const platformPublic = platform
    ? projectEcosystemDirectoryEntry(platform, expected.id, appCount)
    : null
  const diffs = publicFieldDiffs(ownerPublic, platformPublic)
  const relationIssues = [
    ...ecosystemRelationIssues(owner, expected).map(
      (field) => `owner.${field}`
    ),
    ...ecosystemRelationIssues(platform, expected).map(
      (field) => `platform.${field}`
    ),
  ]
  const classification = expected.ambiguous
    ? 'AMBIGUOUS'
    : classifyExpectedDirectoryRecord({
        ownerReadable: ownerResult?.readStatus === 'ready',
        platformReadable: platformResult?.readStatus === 'ready',
        owner,
        platform,
        ownerStatus: owner?.status,
        relationIssues,
        derivedCountIssues,
        publicDiffs: diffs,
      })

  ecosystemRows.push({
    id: expected.id,
    expectedOwner: {
      ecosystemBinding: expected.ecosystemBinding,
      firebaseProjectId:
        ecosystemBindings.get(expected.ecosystemBinding)?.firebaseProjectId ||
        '',
      databaseId: targetResults.get(expected.ownerTargetKey)?.databaseId || '',
      projectId: expected.projectId,
    },
    derivedAppCount: appCount,
    derivedAppIds,
    platformDerivedAppCount: platformDerivedAppIds.length,
    platformDerivedAppIds,
    derivedCountIssues,
    ownerExists: Boolean(owner),
    platformExists: Boolean(platform),
    classification,
    relationIssues,
    publicFieldDiffs: diffs,
    ownerPublicHash: publicProjectionHash(ownerPublic),
    platformPublicHash: publicProjectionHash(platformPublic),
    ...(includePublicValues
      ? { publicValues: { owner: ownerPublic, platform: platformPublic } }
      : {}),
  })
}

appendOrphanRows({
  selectedApps,
  expectedEcosystems,
  targetResults,
  platformResult,
  platformTargetKey,
  appRows,
  ecosystemRows,
})

const reportTargets = [...targetResults.values()]
  .map((target) => ({
    ecosystemBindings: [...target.ecosystemBindings].sort(),
    firebase: {
      projectId: target.firebaseProjectId,
      databaseId: target.databaseId,
      edition: target.edition,
      location: target.location,
      metadataStatus: target.metadataStatus,
      readStatus: target.readStatus,
    },
    credentials: {
      source: target.credentialSource,
    },
    usage: {
      apps: target.readApps,
      ecosystems: target.readEcosystems,
      platform: target.platform,
    },
    errors: [target.metadataError, target.readError].filter(Boolean),
  }))
  .sort((a, b) =>
    `${a.firebase.projectId}/${a.firebase.databaseId}`.localeCompare(
      `${b.firebase.projectId}/${b.firebase.databaseId}`
    )
  )

const blockedTargets = reportTargets
  .filter(
    (target) =>
      target.firebase.edition === 'unknown' ||
      target.firebase.metadataStatus !== 'ready' ||
      target.firebase.readStatus !== 'ready'
  )
  .map((target) => ({
    projectId: target.firebase.projectId,
    databaseId: target.firebase.databaseId,
    errors: target.errors,
  }))

const allRows = [...appRows, ...ecosystemRows]
const report = {
  contractVersion: PLATFORM_DIRECTORY_RECONCILIATION_VERSION,
  mode: 'read-only',
  generatedAt: new Date().toISOString(),
  scope: {
    ecosystem: text(args.ecosystem),
    app: text(args.app),
  },
  publicationAuthDecision: 'google-oidc-service-account',
  targets: reportTargets,
  summary: {
    totals: {
      apps: appRows.length,
      ecosystems: ecosystemRows.length,
      blockedTargets: blockedTargets.length,
    },
    classifications: summarizeDirectoryRows(allRows),
  },
  ecosystems: ecosystemRows.sort((a, b) => a.id.localeCompare(b.id)),
  apps: appRows.sort((a, b) => a.id.localeCompare(b.id)),
  blockedTargets,
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

if (format === 'json') {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(
    JSON.stringify(
      {
        ok: blockedTargets.length === 0,
        mode: report.mode,
        output: path.relative(repoRoot, outputPath),
        targets: report.summary.totals,
        classifications: report.summary.classifications,
      },
      null,
      2
    )
  )
}

await Promise.all([...adminApps.values()].map(({ app }) => deleteApp(app)))

if (
  args.strict &&
  (blockedTargets.length > 0 ||
    allRows.some((row) => row.classification !== 'MATCHED'))
) {
  process.exitCode = 1
}

async function discoverProjectApps() {
  const projectsRoot = path.join(repoRoot, 'projects')
  const groups = await readdir(projectsRoot, { withFileTypes: true })
  const apps = []

  for (const group of groups) {
    if (!group.isDirectory() || group.name === 'templates') continue
    const groupPath = path.join(projectsRoot, group.name)
    const entries = await readdir(groupPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const workspacePath = path.join(groupPath, entry.name)
      const configPath = path.join(workspacePath, 'nuxt.config.ts')
      let source
      try {
        source = await readFile(configPath, 'utf8')
      } catch {
        continue
      }

      const id = literal(source, 'id')
      const ecosystemBinding = literal(source, 'ecosystem')
      const projectId = literal(source, 'projectId')
      if (!id || !ecosystemBinding || !projectId) continue

      apps.push({
        id,
        ecosystemBinding,
        projectId,
        ecosystemId: literal(source, 'ecosystemId'),
        databaseId: literal(source, 'databaseId'),
        role: literal(source, 'role'),
        workspace: path.relative(repoRoot, workspacePath),
      })
    }
  }

  return apps.sort((a, b) => a.id.localeCompare(b.id))
}

async function readEcosystemBinding(name) {
  const packageDir = path.join(
    repoRoot,
    'packages',
    'ecosystem',
    `fireux-${name}`
  )
  const configPath = path.join(
    packageDir,
    'src',
    'config',
    'firebase',
    'ecosystem.config.ts'
  )
  const source = await readFile(configPath, 'utf8')
  const firebaseProjectId = literal(source, 'projectId')
  const databaseId = literal(source, 'databaseId')
  const packageConfigId = literal(source, 'id')
  const firebaserc = JSON.parse(
    await readFile(path.join(packageDir, '.firebaserc'), 'utf8')
  )
  const firebasercProjectId = text(firebaserc?.projects?.default)

  if (firebasercProjectId !== firebaseProjectId) {
    throw new Error(
      `${name} project mismatch: ecosystem.config.ts=${firebaseProjectId}, .firebaserc=${firebasercProjectId}`
    )
  }

  if (!firebaseProjectId || !databaseId || !packageConfigId) {
    throw new Error(`Incomplete Firebase binding for ecosystem ${name}.`)
  }

  return {
    name,
    packageConfigId,
    firebaseProjectId,
    databaseId,
  }
}

function literal(source, key) {
  const match = source.match(
    new RegExp(`\\b${key}\\s*:\\s*(['\"])([^'\"]+)\\1`)
  )
  return text(match?.[2])
}

async function describeDatabase(target) {
  try {
    const { stdout } = await execFileAsync(
      'gcloud',
      [
        'firestore',
        'databases',
        'describe',
        `--project=${target.firebaseProjectId}`,
        `--database=${target.databaseId}`,
        '--format=json',
      ],
      { maxBuffer: 2 * 1024 * 1024 }
    )
    const value = JSON.parse(stdout)
    return {
      status: 'ready',
      edition: text(value.databaseEdition).toLowerCase() || 'unknown',
      location: text(value.locationId),
      error: '',
    }
  } catch (error) {
    return {
      status: 'blocked',
      edition: 'unknown',
      location: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function readCollectionBounded(db, collectionName, maxDocuments = 5000) {
  const result = new Map()
  const pageSize = 250
  let lastDocument = null

  while (result.size < maxDocuments) {
    const remaining = maxDocuments - result.size
    // Ordinary pages stay at pageSize. The final page asks for one sentinel
    // document so an exact limit succeeds while limit + 1 is rejected.
    const limit = remaining <= pageSize ? remaining + 1 : pageSize
    let query = db
      .collection(collectionName)
      .orderBy(FieldPath.documentId())
      .limit(limit)
    if (lastDocument) query = query.startAfter(lastDocument)
    const snapshot = await query.get()

    if (snapshot.size > remaining) {
      throw new Error(
        `${collectionName} exceeded the read-only reconciliation limit of ${maxDocuments} documents.`
      )
    }

    for (const document of snapshot.docs) {
      result.set(document.id, document.data() || {})
    }

    if (snapshot.size < limit) return result
    lastDocument = snapshot.docs.at(-1)
  }

  return result
}

function appendOrphanRows(options) {
  const expectedAppIds = new Set(options.selectedApps.map((app) => app.id))
  const expectedEcosystemIds = new Set(options.expectedEcosystems.keys())
  const expectedAppsByTarget = new Map()
  for (const app of options.selectedApps) {
    const ids = expectedAppsByTarget.get(app.ownerTargetKey) || new Set()
    ids.add(app.id)
    expectedAppsByTarget.set(app.ownerTargetKey, ids)
  }

  const ownerAppCandidates = new Map()
  for (const [targetKey, target] of options.targetResults) {
    if (targetKey === options.platformTargetKey) continue
    const expectedIds = expectedAppsByTarget.get(targetKey) || new Set()
    for (const [id, raw] of target.apps) {
      // Configured ids already have exactly one primary reconciliation row.
      // This also prevents a conflicting duplicate configuration from being
      // reported again as an orphan under its competing owner target.
      if (expectedAppIds.has(id) || expectedIds.has(id)) continue
      const candidates = ownerAppCandidates.get(id) || []
      candidates.push({ target, raw })
      ownerAppCandidates.set(id, candidates)
    }
  }

  const consumedOwnerAppIds = new Set()
  for (const [id, platformRaw] of options.platformResult?.apps || []) {
    if (expectedAppIds.has(id)) continue
    const candidates = ownerAppCandidates.get(id) || []
    const ownerCandidate = candidates.length === 1 ? candidates[0] : null
    const ownerPublic = ownerCandidate
      ? projectAppDirectoryEntry(ownerCandidate.raw, id)
      : null
    const platformPublic = projectAppDirectoryEntry(platformRaw, id)
    const diffs = publicFieldDiffs(ownerPublic, platformPublic)
    const classification =
      candidates.length === 1
        ? 'OWNER_ID_UNRESOLVED'
        : candidates.length > 1
          ? 'AMBIGUOUS'
          : 'ORPHAN_PLATFORM'

    if (candidates.length) consumedOwnerAppIds.add(id)
    options.appRows.push({
      id,
      expectedOwner: ownerCandidate
        ? {
            firebaseProjectId: ownerCandidate.target.firebaseProjectId,
            databaseId: ownerCandidate.target.databaseId,
          }
        : null,
      ownerExists: Boolean(ownerCandidate),
      platformExists: true,
      classification,
      relationIssues: [],
      publicFieldDiffs: diffs,
      ownerPublicHash: publicProjectionHash(ownerPublic),
      platformPublicHash: publicProjectionHash(platformPublic),
      platformMetadata: extractPlatformAppMetadata(platformRaw),
      ...(includePublicValues
        ? { publicValues: { owner: ownerPublic, platform: platformPublic } }
        : {}),
    })
  }

  for (const [id, candidates] of ownerAppCandidates) {
    if (consumedOwnerAppIds.has(id)) continue
    const ownerCandidate = candidates.length === 1 ? candidates[0] : null
    const ownerPublic = ownerCandidate
      ? projectAppDirectoryEntry(ownerCandidate.raw, id)
      : null
    options.appRows.push({
      id,
      expectedOwner: ownerCandidate
        ? {
            firebaseProjectId: ownerCandidate.target.firebaseProjectId,
            databaseId: ownerCandidate.target.databaseId,
          }
        : null,
      ownerExists: true,
      platformExists: false,
      classification: candidates.length === 1 ? 'ORPHAN_OWNER' : 'AMBIGUOUS',
      relationIssues: [],
      publicFieldDiffs: [],
      ownerPublicHash: publicProjectionHash(ownerPublic),
      platformPublicHash: '',
      platformMetadata: { launch_order: 0 },
      ...(includePublicValues
        ? { publicValues: { owner: ownerPublic, platform: null } }
        : {}),
    })
  }

  const expectedEcosystemsByTarget = new Map()
  for (const ecosystem of options.expectedEcosystems.values()) {
    const ids =
      expectedEcosystemsByTarget.get(ecosystem.ownerTargetKey) || new Set()
    ids.add(ecosystem.id)
    expectedEcosystemsByTarget.set(ecosystem.ownerTargetKey, ids)
  }

  const ownerEcosystemCandidates = new Map()
  for (const [targetKey, target] of options.targetResults) {
    if (targetKey === options.platformTargetKey) continue
    const expectedIds = expectedEcosystemsByTarget.get(targetKey) || new Set()
    for (const [id, raw] of target.ecosystems) {
      if (expectedIds.has(id)) continue
      const candidates = ownerEcosystemCandidates.get(id) || []
      candidates.push({ target, raw })
      ownerEcosystemCandidates.set(id, candidates)
    }
  }

  const consumedOwnerEcosystemIds = new Set()
  for (const [id, platformRaw] of options.platformResult?.ecosystems || []) {
    if (expectedEcosystemIds.has(id)) continue
    const candidates = ownerEcosystemCandidates.get(id) || []
    const ownerCandidate = candidates.length === 1 ? candidates[0] : null
    const ownerPublic = ownerCandidate
      ? projectEcosystemDirectoryEntry(ownerCandidate.raw, id, 0)
      : null
    const platformPublic = projectEcosystemDirectoryEntry(platformRaw, id, 0)
    const diffs = publicFieldDiffs(ownerPublic, platformPublic)
    const classification =
      candidates.length === 1
        ? 'OWNER_ID_UNRESOLVED'
        : candidates.length > 1
          ? 'AMBIGUOUS'
          : 'ORPHAN_PLATFORM'

    if (candidates.length) consumedOwnerEcosystemIds.add(id)
    options.ecosystemRows.push({
      id,
      expectedOwner: ownerCandidate
        ? {
            firebaseProjectId: ownerCandidate.target.firebaseProjectId,
            databaseId: ownerCandidate.target.databaseId,
          }
        : null,
      derivedAppCount: 0,
      ownerExists: Boolean(ownerCandidate),
      platformExists: true,
      classification,
      relationIssues: [],
      publicFieldDiffs: diffs,
      ownerPublicHash: publicProjectionHash(ownerPublic),
      platformPublicHash: publicProjectionHash(platformPublic),
      ...(includePublicValues
        ? { publicValues: { owner: ownerPublic, platform: platformPublic } }
        : {}),
    })
  }

  for (const [id, candidates] of ownerEcosystemCandidates) {
    if (consumedOwnerEcosystemIds.has(id)) continue
    const ownerCandidate = candidates.length === 1 ? candidates[0] : null
    const ownerPublic = ownerCandidate
      ? projectEcosystemDirectoryEntry(ownerCandidate.raw, id, 0)
      : null
    options.ecosystemRows.push({
      id,
      expectedOwner: ownerCandidate
        ? {
            firebaseProjectId: ownerCandidate.target.firebaseProjectId,
            databaseId: ownerCandidate.target.databaseId,
          }
        : null,
      derivedAppCount: 0,
      ownerExists: true,
      platformExists: false,
      classification: candidates.length === 1 ? 'ORPHAN_OWNER' : 'AMBIGUOUS',
      relationIssues: [],
      publicFieldDiffs: [],
      ownerPublicHash: publicProjectionHash(ownerPublic),
      platformPublicHash: '',
      ...(includePublicValues
        ? { publicValues: { owner: ownerPublic, platform: null } }
        : {}),
    })
  }
}

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/reconcile-platform-directory.mjs [--ecosystem <binding-or-id>] [--app <appId>] [--out <path>] [--format summary|json] [--include-public-values] [--strict]',
      '',
      'This command has no remote mutation mode. It reads explicitly resolved',
      'named databases, compares public projections, and writes a local report.',
      '',
      'Credential sources, in precedence order:',
      ...firebaseAdminCredentialHelp().map((line) => `  - ${line}`),
    ].join('\n')
  )
}
