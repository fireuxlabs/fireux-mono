// @fireux-script
// last_used: 2026-07-21
// usage_note: run through pnpm guard; locks the disabled publication pipeline and server-only database topology.
// Concurrent edit — 2026-07-21 12:40 CEST — Cleanbox-to-Werkbox migration: verify legacy physical directory scope against current source paths.
// Concurrent edit — 2026-07-19 22:12 CEST — Directory Publication Rules Pass: guard isolated databases, deny-all rules, source scopes, and multi-scope authorization.
// Concurrent edit — 2026-07-20 12:27 CEST — Directory Live Pass: guard read-only dry-runs, state-free capability checks, exact hashes, and per-batch revalidation.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: guard shared protected backup mechanics and domain-local apply authority.

import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { buildPlatformDirectoryBackfillPlan } from '../_lib/platform-directory-backfill.mjs'
import {
  buildPlatformDirectoryRemediationPlan,
  PLATFORM_DIRECTORY_REMEDIATION_DECISIONS,
} from '../_lib/platform-directory-remediation.mjs'
import {
  assertApplyConfirmation,
  assertCredentialFreeBackup,
  LOCKED_RECONCILIATION_SHA256,
  PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION,
} from '../_lib/platform-directory-remediation-executor.mjs'
import {
  DIRECTORY_PUBLICATION_DATABASES,
  DIRECTORY_PUBLICATION_DATA_ROLE,
  DIRECTORY_PUBLICATION_EXCLUSIONS,
  DIRECTORY_PUBLICATION_INFRASTRUCTURE,
  DIRECTORY_PUBLICATION_RECEIVER,
  DIRECTORY_PUBLICATION_TARGETS,
} from '../_lib/directory-publication-targets.mjs'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

const VALIDATE_PATH =
  'packages/core/fireux-core/src/runtime/server/utils/directory-publication/validate.ts'
const MODEL_PATH =
  'packages/core/fireux-core/src/runtime/models/core/supporting/directory-publication.ts'
const REDUCE_PATH =
  'packages/core/fireux-core/src/runtime/server/utils/directory-publication/reduce.ts'
const FIRESTORE_PATH =
  'packages/core/fireux-core/src/runtime/server/utils/directory-publication/firestore.ts'
const OIDC_PATH =
  'packages/core/fireux-core/src/runtime/server/utils/directory-publication/oidc.ts'
const SERVICE_ACCOUNT_OIDC_PATH =
  'packages/core/fireux-core/src/runtime/server/utils/auth/service-account-oidc.ts'
const OWNER_PATH =
  'packages/core/fireux-core/src/runtime/server/utils/directory-publication/owner.ts'
const RECEIVER_PATH =
  'projects/fireux/fireux-app/server/api/internal/directory/publications.post.ts'
const RECEIVER_CONFIG_PATH =
  'projects/fireux/fireux-app/server/utils/directory-publication/config.ts'
const BACKFILL_SCRIPT_PATH = 'scripts/plan-platform-directory-backfill.mjs'
const BACKFILL_LIB_PATH = 'scripts/_lib/platform-directory-backfill.mjs'
const REMEDIATION_SCRIPT_PATH =
  'scripts/plan-platform-directory-remediation.mjs'
const REMEDIATION_LIB_PATH = 'scripts/_lib/platform-directory-remediation.mjs'
const INFRASTRUCTURE_SCRIPT_PATH =
  'scripts/provision-directory-publication-infrastructure.mjs'
const PROTECTED_JSON_ARTIFACT_PATH = 'scripts/_lib/protected-json-artifact.mjs'
const REMEDIATION_EXECUTOR_SCRIPT_PATH =
  'scripts/remediate-platform-directory.mjs'
const REMEDIATION_EXECUTOR_LIB_PATH =
  'scripts/_lib/platform-directory-remediation-executor.mjs'
const RULES_DIRECTORY = 'scripts/firebase/directory-publication'
const RULES_PATH = `${RULES_DIRECTORY}/server-only.rules`

const RULE_CONFIG_DATABASES = new Map([
  ['bringli.firebase.json', ['directory-outbox']],
  ['cleanbox.firebase.json', ['directory-outbox']],
  ['fireux.firebase.json', ['directory-outbox', 'platform-directory']],
  ['granite.firebase.json', ['directory-outbox']],
  ['misebox.firebase.json', ['directory-outbox']],
  ['slap.firebase.json', ['directory-outbox']],
])

const SKIP_DIRECTORIES = new Set([
  '.firebase',
  '.nuxt',
  '.output',
  'dist',
  'node_modules',
])

function namedFilesBelow(rootPath, names) {
  if (!existsSync(rootPath)) return []

  return readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(rootPath, entry.name)
    if (entry.isDirectory()) {
      return SKIP_DIRECTORIES.has(entry.name)
        ? []
        : namedFilesBelow(entryPath, names)
    }
    return names.has(entry.name) ? [entryPath] : []
  })
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const modelSource = read(repoRoot, MODEL_PATH)
  const validatorSource = read(repoRoot, VALIDATE_PATH)
  const reducerSource = read(repoRoot, REDUCE_PATH)
  const firestoreSource = read(repoRoot, FIRESTORE_PATH)
  const oidcSource = [
    read(repoRoot, OIDC_PATH),
    read(repoRoot, SERVICE_ACCOUNT_OIDC_PATH),
  ].join('\n')
  const ownerSource = read(repoRoot, OWNER_PATH)
  const receiverSource = read(repoRoot, RECEIVER_PATH)
  const receiverConfigSource = read(repoRoot, RECEIVER_CONFIG_PATH)
  const backfillScriptSource = read(repoRoot, BACKFILL_SCRIPT_PATH)
  const backfillLibSource = read(repoRoot, BACKFILL_LIB_PATH)
  const remediationScriptSource = read(repoRoot, REMEDIATION_SCRIPT_PATH)
  const remediationLibSource = read(repoRoot, REMEDIATION_LIB_PATH)
  const infrastructureScriptSource = read(repoRoot, INFRASTRUCTURE_SCRIPT_PATH)
  const protectedJsonArtifactSource = read(
    repoRoot,
    PROTECTED_JSON_ARTIFACT_PATH
  )
  const remediationExecutorScriptSource = read(
    repoRoot,
    REMEDIATION_EXECUTOR_SCRIPT_PATH
  )
  const remediationExecutorLibSource = read(
    repoRoot,
    REMEDIATION_EXECUTOR_LIB_PATH
  )
  const rulesSource = read(repoRoot, RULES_PATH)

  assertReceiverIsFailClosed({
    receiverSource,
    receiverConfigSource,
    oidcSource,
  })
  assertOwnerFactoryIsDormant({ repoRoot, ownerSource })
  assertServerOnlyRulesTopology({
    repoRoot,
    modelSource,
    ownerSource,
    receiverConfigSource,
    rulesSource,
  })
  assertPublisherTargets()
  assertInfrastructureProvisioningIsFailClosed({
    repoRoot,
    infrastructureScriptSource,
    protectedJsonArtifactSource,
  })
  assertBackfillIsFailClosed({
    repoRoot,
    backfillScriptSource,
    backfillLibSource,
  })
  assertRemediationIsFailClosed({
    repoRoot,
    remediationScriptSource,
    remediationLibSource,
  })
  assertRemediationExecutorIsFailClosed({
    repoRoot,
    remediationExecutorScriptSource,
    remediationExecutorLibSource,
  })
  assertTransactionBoundary({ validatorSource, reducerSource, firestoreSource })

  const requireFromCore = createRequire(
    path.join(repoRoot, 'packages/core/fireux-core/package.json')
  )
  const { createJiti } = requireFromCore('jiti')
  const jiti = createJiti(import.meta.url, { moduleCache: false })
  const [validator, reducer, firestore, owner] = await Promise.all([
    jiti.import(path.join(repoRoot, VALIDATE_PATH)),
    jiti.import(path.join(repoRoot, REDUCE_PATH)),
    jiti.import(path.join(repoRoot, FIRESTORE_PATH)),
    jiti.import(path.join(repoRoot, OWNER_PATH)),
  ])

  runPublicationFixtures({ validator, reducer, firestore })
  runOwnerFixtures({ validator, owner })
  runBackfillFixtures()
  runRemediationFixtures()
  runRemediationExecutorFixtures()
  console.log('[guard] ✅ directory publication scaffold and rules valid')
}

function assertReceiverIsFailClosed({
  receiverSource,
  receiverConfigSource,
  oidcSource,
}) {
  assert.match(receiverConfigSource, /RECEIVER_ENABLED\s*\|\|\s*['"]{2}/)
  assert.match(receiverConfigSource, /===\s*['"]true['"]/)
  assert.match(
    receiverConfigSource,
    /FIREUX_DIRECTORY_PUBLICATION_OIDC_AUDIENCE/
  )
  assert.match(receiverSource, /if\s*\(!config\.enabled\)/)
  assert.match(receiverSource, /statusCode:\s*404/)
  assert.match(
    receiverSource,
    /verifyDirectoryPublisherOidc\(token, config\.audience\)/
  )
  assert.match(receiverSource, /MAX_BODY_BYTES\s*=\s*64\s*\*\s*1024/)
  assert.match(receiverSource, /isDirectoryPublicationDatabase\(databaseId\)/)
  assert.match(
    receiverConfigSource,
    /FIREUX_DIRECTORY_PUBLICATION_DATABASE_ID\s*\|\|\s*['"]{2}/
  )
  assert.match(
    receiverConfigSource,
    /databaseId\s*===\s*DirectoryPublicationDatabases\.platform/
  )
  assert.doesNotMatch(
    receiverConfigSource,
    /FIREUX_DIRECTORY_PUBLICATION_DATABASE_ID\s*\|\|\s*['"]fireux['"]/
  )

  assert.match(oidcSource, /const fixedAudience\s*=\s*audience\.trim\(\)/)
  assert.match(oidcSource, /audience:\s*fixedAudience/)
  assert.match(oidcSource, /maxExpiry:\s*3600/)
  assert.match(oidcSource, /email_verified\s*!==\s*true/)
  assert.match(oidcSource, /gserviceaccount\\\.com/)

  assert.doesNotMatch(
    `${receiverConfigSource}\n${receiverSource}`,
    /getRequestHost\s*\(|getRequestURL\s*\(|getHeader\s*\([^,]+,\s*['"]host['"]\)|headers?\.host\b/i
  )
  assert.doesNotMatch(
    receiverSource,
    /Access-Control-Allow-Origin|\b(?:setCorsHeaders|handleCors|isCorsOriginAllowed)\b|\bcors\s*\(/i
  )
  assert.doesNotMatch(
    receiverSource,
    /requireFirebaseBearerUser|firebase-admin\/auth|\bgetAuth\s*\(|\bverifyIdToken\s*\(/
  )
}

function assertOwnerFactoryIsDormant({ repoRoot, ownerSource }) {
  assert.match(ownerSource, /export function createDirectoryPublisherFunctions/)
  assert.match(ownerSource, /if\s*\(!config\.enabled\)\s*return/)
  assert.match(ownerSource, /onDocumentWritten\s*\(/)
  assert.match(ownerSource, /retry:\s*true/)
  assert.match(ownerSource, /serviceAccount:\s*config\.serviceAccount/)
  assert.match(ownerSource, /getFirestore\(config\.outboxDatabaseId\)/)
  assert.match(
    ownerSource,
    /config\.outboxDatabaseId\s*!==\s*DirectoryPublicationDatabases\.ownerOutbox/
  )

  const registrationFiles = [
    ...namedFilesBelow(path.join(repoRoot, 'packages'), new Set(['module.ts'])),
    ...namedFilesBelow(path.join(repoRoot, 'projects'), new Set(['module.ts'])),
  ]
  assert.ok(registrationFiles.length > 0, 'Expected package module files.')
  for (const file of registrationFiles) {
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(
      source,
      /createDirectoryPublisherFunctions|directory-publication\/owner/,
      `Directory publisher factory must remain dormant: ${path.relative(repoRoot, file)}`
    )
  }

  const firebaseConfigs = namedFilesBelow(
    path.join(repoRoot, 'projects'),
    new Set(['firebase.json'])
  )
  assert.ok(firebaseConfigs.length > 0, 'Expected project firebase.json files.')
  for (const file of firebaseConfigs) {
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(
      source,
      /directory[-_ ]?(?:publication|publisher|outbox)/i,
      `Directory publisher must not be deployed yet: ${path.relative(repoRoot, file)}`
    )
  }
}

function assertServerOnlyRulesTopology({
  repoRoot,
  modelSource,
  ownerSource,
  receiverConfigSource,
  rulesSource,
}) {
  assert.equal(DIRECTORY_PUBLICATION_DATABASES.ownerOutbox, 'directory-outbox')
  assert.equal(DIRECTORY_PUBLICATION_DATABASES.platform, 'platform-directory')
  assert.match(modelSource, /ownerOutbox:\s*['"]directory-outbox['"]/)
  assert.match(modelSource, /platform:\s*['"]platform-directory['"]/)
  assert.match(ownerSource, /DirectoryPublicationDatabases\.ownerOutbox/)
  assert.match(receiverConfigSource, /DirectoryPublicationDatabases\.platform/)

  assert.match(rulesSource, /rules_version\s*=\s*['"]2['"]\s*;/)
  assert.match(
    rulesSource,
    /function\s+serverOnly\s*\(\)\s*{\s*return\s+false\s*;/s
  )
  for (const collection of [
    'directory-publication-outbox',
    'directory-app-projections',
    'directory-ecosystem-projections',
    'directory-publication-receipts',
    'directory-curation',
    'directory-sources',
    'project-user-monitor',
  ]) {
    assert.match(
      rulesSource,
      new RegExp(`match\\s+/${collection}/\\{document=\\*\\*\\}`)
    )
  }
  assert.match(rulesSource, /match\s+\/\{document=\*\*\}/)
  assert.doesNotMatch(rulesSource, /request\.auth|allow\s+[^;]+:\s*if\s+true/i)
  const allows =
    rulesSource.match(/allow\s+read,\s*write:\s*if\s+serverOnly\(\)\s*;/g) || []
  assert.equal(allows.length, 8, 'Every rules match must use the false helper.')

  const rulesDirectory = path.join(repoRoot, RULES_DIRECTORY)
  const configFiles = readdirSync(rulesDirectory)
    .filter((name) => name.endsWith('.firebase.json'))
    .sort()
  assert.deepEqual(configFiles, [...RULE_CONFIG_DATABASES.keys()].sort())
  for (const name of configFiles) {
    const config = JSON.parse(
      readFileSync(path.join(rulesDirectory, name), 'utf8')
    )
    assert.deepEqual(Object.keys(config), ['firestore'])
    assert.ok(Array.isArray(config.firestore))
    assert.deepEqual(
      config.firestore.map((entry) => entry.database),
      RULE_CONFIG_DATABASES.get(name)
    )
    for (const entry of config.firestore) {
      assert.deepEqual(Object.keys(entry).sort(), ['database', 'rules'])
      assert.equal(entry.rules, 'server-only.rules')
      assert.notEqual(entry.database, '(default)')
      assert.notEqual(entry.database, 'fireux')
      assert.notEqual(entry.database, 'misebox')
      assert.notEqual(entry.database, 'bringli')
      assert.notEqual(entry.database, 'cleanbox')
      assert.notEqual(entry.database, 'granite')
      assert.notEqual(entry.database, 'slap')
    }
  }

  const ordinaryFirebaseConfigs = namedFilesBelow(
    path.join(repoRoot, 'projects'),
    new Set(['firebase.json'])
  )
  assert.ok(ordinaryFirebaseConfigs.length > 0)
  for (const file of ordinaryFirebaseConfigs) {
    const config = JSON.parse(readFileSync(file, 'utf8'))
    assert.equal(
      Object.prototype.hasOwnProperty.call(config, 'firestore'),
      false,
      `Ordinary app deploy must not own Firestore rules: ${path.relative(repoRoot, file)}`
    )
  }
}

function assertPublisherTargets() {
  assert.deepEqual(DIRECTORY_PUBLICATION_DATA_ROLE, {
    id: 'directoryPublicationWriter',
    title: 'Directory publication writer',
    description:
      'Reads and creates or updates directory publication records without delete or list access.',
    stage: 'GA',
    permissions: [
      'datastore.databases.get',
      'datastore.entities.create',
      'datastore.entities.get',
      'datastore.entities.update',
    ],
  })
  assert.deepEqual(DIRECTORY_PUBLICATION_RECEIVER, {
    firebaseProjectId: 'fireux-2005',
    databaseId: 'platform-directory',
    serviceAccount: 'directory-receiver@fireux-2005.iam.gserviceaccount.com',
  })
  const expectedInfrastructure = [
    ['bringli', 'bringli-b0517', 'europe-west6', ['directory-outbox']],
    ['buenohost', 'buenohost-ecosystem', 'eur3', ['directory-outbox']],
    ['cleanbox', 'cleanbox-f15bc', 'eur3', ['directory-outbox']],
    [
      'fireux',
      'fireux-2005',
      'eur3',
      ['directory-outbox', 'platform-directory'],
    ],
    ['granite', 'granite-ecosystem', 'nam5', ['directory-outbox']],
    ['misebox', 'misebox-78f9c', 'eur3', ['directory-outbox']],
    ['slap', 'slap-45389', 'europe-west1', ['directory-outbox']],
  ]
  const expectedTargetIds = [
    'bringli',
    'cleanbox',
    'fireux-blank',
    'fireux-buenohost',
    'fireux-ecosystem',
    'fireux-find-my-seo',
    'fireux-go-qr',
    'fireux-sproochli',
    'granite',
    'misebox',
    'slap',
  ]
  const expectedAppIds = [
    'baeren-ringgenberg',
    'bangin-coffee',
    'book-with-nats',
    'bringli-app',
    'buenohost',
    'cleanbox-app',
    'find-my-seo-app',
    'fireux-app',
    'fireux-blank',
    'fireux-tenant',
    'go-qr',
    'granite-app',
    'la-tap-berne',
    'misebox-app',
    'richies-reinigung',
    'slap-app',
    'sproochli',
    'yellow-velo',
  ]
  const expectedEcosystemIds = [
    'bringli',
    'buenohost',
    'cleanbox',
    'fireux',
    'granite',
    'misebox',
    'slap',
  ]
  const expectedRegions = new Map([
    ['bringli', 'europe-west6'],
    ['cleanbox', 'europe-west1'],
    ['fireux-blank', 'europe-west1'],
    ['fireux-buenohost', 'europe-west6'],
    ['fireux-ecosystem', 'europe-west1'],
    ['fireux-find-my-seo', 'europe-west1'],
    ['fireux-go-qr', 'europe-west1'],
    ['fireux-sproochli', 'europe-west1'],
    ['granite', 'us-central1'],
    ['misebox', 'europe-west1'],
    ['slap', 'europe-west1'],
  ])

  assert.deepEqual(
    DIRECTORY_PUBLICATION_INFRASTRUCTURE.map((target) => [
      target.id,
      target.firebaseProjectId,
      target.location,
      [...target.databases],
    ]).sort((left, right) => left[0].localeCompare(right[0])),
    expectedInfrastructure
  )
  for (const target of DIRECTORY_PUBLICATION_INFRASTRUCTURE) {
    assert.equal(target.edition, 'standard')
    assert.equal(target.deleteProtection, 'ENABLED')
    assert.equal(
      target.rulesConfig,
      `scripts/firebase/directory-publication/${target.id}.firebase.json`
    )
    assert.equal(
      target.publisherServiceAccount,
      `directory-publisher@${target.firebaseProjectId}.iam.gserviceaccount.com`
    )
    assert.deepEqual(
      RULE_CONFIG_DATABASES.get(`${target.id}.firebase.json`),
      target.databases
    )
  }

  assert.deepEqual(
    DIRECTORY_PUBLICATION_TARGETS.map((target) => target.id).sort(),
    expectedTargetIds
  )
  assert.deepEqual(
    DIRECTORY_PUBLICATION_TARGETS.flatMap(
      (target) => target.allowedAppIds
    ).sort(),
    expectedAppIds
  )
  assert.deepEqual(
    DIRECTORY_PUBLICATION_TARGETS.flatMap(
      (target) => target.allowedEcosystemIds
    ).sort(),
    expectedEcosystemIds
  )
  assert.deepEqual(
    DIRECTORY_PUBLICATION_EXCLUSIONS.map((entry) => entry.entityId).sort(),
    ['qrdoc']
  )

  const seenApps = new Set()
  const seenEcosystems = new Set()
  for (const target of DIRECTORY_PUBLICATION_TARGETS) {
    assert.equal(target.region, expectedRegions.get(target.id))
    assert.equal(
      target.outboxDatabaseId,
      DIRECTORY_PUBLICATION_DATABASES.ownerOutbox
    )
    assert.notEqual(target.databaseId, target.outboxDatabaseId)
    assert.notEqual(target.databaseId, DIRECTORY_PUBLICATION_DATABASES.platform)
    assert.equal(
      target.serviceAccount,
      `directory-publisher@${target.firebaseProjectId}.iam.gserviceaccount.com`
    )
    if (target.ecosystemId) {
      assert.deepEqual(target.allowedEcosystemIds, [target.ecosystemId])
    } else {
      assert.deepEqual(target.allowedEcosystemIds, [])
    }
    for (const appId of target.allowedAppIds) {
      assert.equal(seenApps.has(appId), false, `Duplicate App scope: ${appId}`)
      seenApps.add(appId)
    }
    for (const ecosystemId of target.allowedEcosystemIds) {
      assert.equal(
        seenEcosystems.has(ecosystemId),
        false,
        `Duplicate Ecosystem scope: ${ecosystemId}`
      )
      seenEcosystems.add(ecosystemId)
    }
  }
}

function assertInfrastructureProvisioningIsFailClosed({
  repoRoot,
  infrastructureScriptSource,
  protectedJsonArtifactSource,
}) {
  assert.match(
    infrastructureScriptSource,
    /APPLY_CONFIRMATION\s*=\s*['"]PROVISION_DIRECTORY_PUBLICATION_INFRASTRUCTURE['"]/
  )
  assert.match(
    infrastructureScriptSource,
    /if\s*\(result\.apply\s*&&\s*result\.confirm\s*!==\s*APPLY_CONFIRMATION\)/
  )
  assert.match(
    infrastructureScriptSource,
    /const backup\s*=\s*await writeBackup\(inspections\)/
  )
  assert.match(
    infrastructureScriptSource,
    /await firebaseRulesDryRun\(target\)|firebaseRulesDryRun\(target\)/
  )
  assert.match(
    infrastructureScriptSource,
    /DIRECTORY_PUBLICATION_DATA_ROLE\.id/
  )
  assert.match(
    infrastructureScriptSource,
    /DIRECTORY_PUBLICATION_DATA_ROLE\.permissions/
  )
  assert.match(infrastructureScriptSource, /removeLegacyPublisherAccess/)
  assert.match(infrastructureScriptSource, /waitForCustomDataBindings/)
  assert.match(infrastructureScriptSource, /const overlapVerified\s*=\s*\[\]/)
  assert.match(
    infrastructureScriptSource,
    /inspection\.target\.id\s*===\s*['"]slap['"]/
  )
  assert.match(
    infrastructureScriptSource,
    /billing_required_for_named_database/
  )
  assert.match(infrastructureScriptSource, /retryPropagation/)
  assert.match(infrastructureScriptSource, /writeProtectedJsonArtifact\s*\(/)
  assert.match(
    protectedJsonArtifactSource,
    /open\(path,\s*['"]wx['"],\s*0o600\)/
  )
  assert.match(protectedJsonArtifactSource, /handle\.chmod\(0o600\)/)
  assert.match(protectedJsonArtifactSource, /file\.mode\s*&\s*0o777/)
  assert.match(protectedJsonArtifactSource, /!==\s*0o600/)
  assert.match(infrastructureScriptSource, /createReceiverServiceAccount/)
  assert.match(infrastructureScriptSource, /grantReceiverPlatformAccess/)
  assert.match(
    infrastructureScriptSource,
    /directory-receiver@fireux-2005\.iam\.gserviceaccount\.com|DIRECTORY_PUBLICATION_RECEIVER\.serviceAccount/
  )
  assert.match(
    infrastructureScriptSource,
    /resource\.name==["']projects\/\$\{target\.firebaseProjectId\}\/databases\//
  )
  assert.match(infrastructureScriptSource, /--delete-protection/)
  assert.doesNotMatch(
    infrastructureScriptSource,
    /firestore:databases:(?:delete|restore)|service-accounts\s+delete/
  )
  assert.doesNotMatch(infrastructureScriptSource, /['"]--all['"]/)

  const rejected = spawnSync(
    process.execPath,
    [path.join(repoRoot, INFRASTRUCTURE_SCRIPT_PATH), '--apply'],
    { cwd: repoRoot, encoding: 'utf8' }
  )
  assert.notEqual(
    rejected.status,
    0,
    'Infrastructure apply must require confirmation.'
  )
  assert.match(
    `${rejected.stdout || ''}\n${rejected.stderr || ''}`,
    /--apply requires --confirm PROVISION_DIRECTORY_PUBLICATION_INFRASTRUCTURE/
  )

  const rejectedPending = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, INFRASTRUCTURE_SCRIPT_PATH),
      '--allow-pending-slap-billing',
    ],
    { cwd: repoRoot, encoding: 'utf8' }
  )
  assert.notEqual(rejectedPending.status, 0)
  assert.match(
    `${rejectedPending.stdout || ''}\n${rejectedPending.stderr || ''}`,
    /--allow-pending-slap-billing is valid only with --apply/
  )
}

function assertBackfillIsFailClosed({
  repoRoot,
  backfillScriptSource,
  backfillLibSource,
}) {
  const combined = `${backfillScriptSource}\n${backfillLibSource}`
  assert.match(backfillLibSource, /mode:\s*['"]dry-run-disabled['"]/)
  assert.match(backfillLibSource, /enabled:\s*false/)
  assert.match(backfillLibSource, /remoteReads:\s*false/)
  assert.match(backfillLibSource, /remoteWrites:\s*false/)
  assert.match(backfillLibSource, /legacyDeletes:\s*false/)
  assert.match(backfillLibSource, /publicPayloadsIncluded:\s*false/)
  assert.doesNotMatch(
    combined,
    /(?:from\s+|import\s*\()['"](?:firebase|@google-cloud)|firebase-admin|firebase-functions/
  )
  assert.doesNotMatch(
    backfillScriptSource,
    /--(?:apply|commit|write)\b|\b(?:args|parsed)\.(?:apply|commit|write)\b|['"](?:apply|commit|write)['"]/
  )

  const rejected = spawnSync(
    process.execPath,
    [path.join(repoRoot, BACKFILL_SCRIPT_PATH), '--apply'],
    { cwd: repoRoot, encoding: 'utf8' }
  )
  assert.notEqual(rejected.status, 0, 'Backfill planner must reject --apply.')
  assert.match(
    `${rejected.stdout || ''}\n${rejected.stderr || ''}`,
    /Unknown option: --apply/
  )
}

function assertRemediationIsFailClosed({
  repoRoot,
  remediationScriptSource,
  remediationLibSource,
}) {
  const combined = `${remediationScriptSource}\n${remediationLibSource}`
  assert.match(remediationLibSource, /mode:\s*['"]dry-run-disabled['"]/)
  assert.match(remediationLibSource, /enabled:\s*false/)
  assert.match(remediationLibSource, /remoteWrites:\s*false/)
  assert.match(remediationLibSource, /executionReady:\s*false/)
  assert.match(remediationLibSource, /publicValuesIncluded:\s*false/)
  assert.match(remediationLibSource, /credentialsIncluded:\s*false/)
  assert.match(remediationLibSource, /tokenUrlsIncluded:\s*false/)
  assert.match(remediationLibSource, /legacyDeletes:\s*false/)
  assert.doesNotMatch(
    combined,
    /(?:from\s+|import\s*\()['"](?:firebase|@google-cloud)|firebase-admin|firebase-functions/
  )

  for (const option of ['--apply', '--commit']) {
    const rejected = spawnSync(
      process.execPath,
      [path.join(repoRoot, REMEDIATION_SCRIPT_PATH), option],
      { cwd: repoRoot, encoding: 'utf8' }
    )
    assert.notEqual(
      rejected.status,
      0,
      `Remediation planner must reject ${option}.`
    )
    assert.match(
      `${rejected.stdout || ''}\n${rejected.stderr || ''}`,
      new RegExp(`Unknown option: ${option}`)
    )
  }
}

function assertRemediationExecutorIsFailClosed({
  remediationExecutorScriptSource,
  remediationExecutorLibSource,
}) {
  assert.match(
    remediationExecutorLibSource,
    /LOCKED_RECONCILIATION_SHA256\s*=\s*['"][a-f0-9]{64}['"]/
  )
  assert.match(
    remediationExecutorLibSource,
    /PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION\s*=\s*['"]APPLY_PLATFORM_DIRECTORY_REMEDIATION_[a-f0-9]{12}['"]/
  )
  assert.match(remediationExecutorScriptSource, /assertApplyConfirmation\s*\(/)
  assert.match(remediationExecutorScriptSource, /if\s*\(!apply\)/)
  assert.match(remediationExecutorScriptSource, /remoteWrites:\s*false/)
  assert.match(
    remediationExecutorScriptSource,
    /Dry-run performs no mutation call/
  )
  assert.doesNotMatch(
    remediationExecutorScriptSource,
    /permission[_ -]?probe|fireux-remediation-permission-probes|Timestamp\.fromMillis\(0\)/i
  )
  assert.equal(
    (remediationExecutorScriptSource.match(/\.commit\s*\(/g) || []).length,
    1,
    'The executor must have only the journaled apply batch commit.'
  )
  assert.match(remediationExecutorScriptSource, /batch\.create\(operation\.ref/)
  assert.match(
    remediationExecutorScriptSource,
    /lastUpdateTime:\s*operation\.lastUpdateTime/
  )
  assert.match(remediationExecutorScriptSource, /FieldValue\.delete\(\)/)
  assert.doesNotMatch(
    remediationExecutorScriptSource,
    /batch\.delete\s*\(|\.ref\.delete\s*\(|deleteDoc\s*\(/
  )
  assert.match(
    remediationExecutorScriptSource,
    /open\(backupPath,\s*['"]wx['"],\s*0o600\)/
  )
  assert.match(remediationExecutorScriptSource, /await handle\.sync\(\)/)
  assert.match(
    remediationExecutorScriptSource,
    /after completed batches \[\$\{completed\.join/
  )
  assert.match(remediationExecutorScriptSource, /beforeGroupCommit/)
  assert.match(remediationExecutorScriptSource, /verifyReadPreconditions/)
  assert.match(
    remediationExecutorScriptSource,
    /body:\s*new URLSearchParams\(\{ access_token: token \}\)/
  )
  assert.doesNotMatch(
    remediationExecutorScriptSource,
    /searchParams\.set\(['"]access_token|tokeninfo\?/
  )
  assert.match(
    remediationExecutorScriptSource,
    /documents:commit[\s\S]*currentDocument:\s*\{ exists: false \}[\s\S]*currentDocument:\s*\{ exists: true \}/
  )
  assert.match(
    remediationExecutorScriptSource,
    /\['FAILED_PRECONDITION', 'NOT_FOUND'\]\.includes\(rejectionStatus\)/
  )
  assert.match(
    remediationExecutorScriptSource,
    /after\.some\(\(snapshot\) => snapshot\.exists\)/
  )
  assert.doesNotMatch(remediationExecutorScriptSource, /readFile\([^)]*\.env/)
  assert.match(remediationExecutorLibSource, /createAuthorityReader/)
  assert.match(
    remediationExecutorLibSource,
    /authoritativeInputHashes:\s*await authorityReader\.hashes\(\)/
  )

  const mainIndex = remediationExecutorScriptSource.indexOf(
    'async function main()'
  )
  const dryRunReturnIndex = remediationExecutorScriptSource.indexOf(
    'if (!apply) {',
    mainIndex
  )
  assert.ok(mainIndex >= 0 && dryRunReturnIndex > mainIndex)
  assert.doesNotMatch(
    remediationExecutorScriptSource.slice(mainIndex, dryRunReturnIndex),
    /\.(?:set|create|update|delete|commit)\s*\(/
  )
  const capabilityIndex = remediationExecutorScriptSource.indexOf(
    'const writeCapabilityChecks = await assertWriteCapabilities',
    dryRunReturnIndex
  )
  assert.ok(capabilityIndex > dryRunReturnIndex)

  const verifyIndex = remediationExecutorScriptSource.indexOf(
    'await verifyPlatformReadPreconditions(preflight)'
  )
  const backupIndex = remediationExecutorScriptSource.indexOf(
    'const backup = await writeBackup'
  )
  const applyIndex = remediationExecutorScriptSource.indexOf(
    'const completedBatches = await applyOperations'
  )
  assert.ok(verifyIndex >= 0 && verifyIndex < backupIndex)
  assert.ok(capabilityIndex < backupIndex)
  assert.ok(backupIndex < applyIndex)
}

function assertTransactionBoundary({
  validatorSource,
  reducerSource,
  firestoreSource,
}) {
  assert.match(
    validatorSource,
    /MAX_FUTURE_SKEW_MS\s*=\s*5\s*\*\s*60\s*\*\s*1000/
  )
  assert.match(reducerSource, /compareDirectoryPublicationOrderV1/)
  assert.match(reducerSource, /receiptExists/)
  assert.match(reducerSource, /projection_source_mismatch/)
  assert.match(firestoreSource, /directoryPublicationReceiptId/)
  assert.match(firestoreSource, /directoryPublicationSourceAuthorizationId/)
  assert.match(firestoreSource, /createHash\(['"]sha256['"]\)/)
  assert.match(firestoreSource, /db\.runTransaction/)
  assert.match(firestoreSource, /transaction\.get\(sourceRef\)/)
  assert.match(firestoreSource, /transaction\.get\(receiptRef\)/)
  assert.match(firestoreSource, /transaction\.get\(projectionRef\)/)
  assert.match(
    firestoreSource,
    /authorization\.authorization_id\s*!==\s*sourceRef\.id/
  )
  assert.match(firestoreSource, /transaction\.create\(receiptRef/)
  assert.match(firestoreSource, /transaction\.set\(projectionRef/)
  assert.doesNotMatch(firestoreSource, /DirectoryPublicationStorage\.curation/)
}

function runPublicationFixtures({ validator, reducer, firestore }) {
  const nowMs = Date.parse('2026-07-19T16:00:00.000Z')
  const appliedAt = '2026-07-19T16:00:01.000Z'
  const source = {
    firebase_project_id: 'misebox-78f9c',
    database_id: 'misebox',
    project_id: 'misebox',
    ecosystem_id: 'misebox',
  }
  const principal = {
    oidc_subject: 'publisher-subject-1',
    service_account_email:
      'directory-publisher@misebox-78f9c.iam.gserviceaccount.com',
  }
  const authorizationId = firestore.directoryPublicationSourceAuthorizationId(
    principal.oidc_subject,
    source
  )
  const authorization = validator.parseDirectorySourceAuthorizationV1({
    version: 1,
    authorization_id: authorizationId,
    oidc_subject: principal.oidc_subject,
    service_account_email: principal.service_account_email,
    ...source,
    allowed_entity_kinds: ['app', 'ecosystem'],
    allowed_app_ids: ['misebox-app'],
    allowed_ecosystem_ids: ['misebox'],
    enabled: true,
    updated_at: '2026-07-19T14:00:00.000Z',
  })
  assert.equal(authorization.authorization_id, authorizationId)
  assert.notEqual(
    authorizationId,
    firestore.directoryPublicationSourceAuthorizationId(
      principal.oidc_subject,
      { ...source, database_id: 'another-owner-database' }
    )
  )

  const rawUpsert = {
    version: 1,
    event_id: 'event-a',
    action: 'upsert',
    entity: { kind: 'app', id: 'misebox-app' },
    source,
    revision: {
      source_event_time: '2026-07-19T15:00:00.000000000Z',
    },
    payload: {
      ecosystem_id: 'misebox',
      slug: 'misebox-app',
      status: 'active',
      app_name: 'Misebox',
      app_short_name: 'Misebox',
      role: 'global',
      tagline: 'Hospitality operations',
      description: 'Canonical owner description.',
      short_bio: 'Hospitality tools.',
      derived: { user_count: 4 },
      media: {
        logo_url: '/img/app/logo.png',
        thumbnail_url: '/img/app/thumbnail.png',
        wordmark_light_url: '/img/app/wordmark-light.png',
        wordmark_dark_url: '/img/app/wordmark-dark.png',
        cover_url: '/img/app/cover.png',
      },
    },
  }

  const eventAt = (eventId, sourceEventTime, action = 'upsert') => {
    const raw = structuredClone(rawUpsert)
    raw.event_id = eventId
    raw.revision.source_event_time = sourceEventTime
    raw.action = action
    if (action === 'retire') delete raw.payload
    return validator.parseDirectoryPublicationV1(raw, { nowMs })
  }
  const reduce = (event, overrides = {}) =>
    reducer.reduceDirectoryPublication({
      event,
      authorization,
      principal,
      currentProjection: null,
      receiptExists: false,
      appliedAt,
      ...overrides,
    })

  const initialEvent = eventAt('event-a', '2026-07-19T15:00:00.000000000Z')
  const initial = reduce(initialEvent)
  assert.equal(initial.outcome, 'applied')
  assert.equal(initial.reason, 'upsert_applied')
  assert.equal(initial.receipt?.outcome, 'applied')
  assert.equal(initial.projection?.state, 'active')
  assert.deepEqual(initial.projection?.payload, initialEvent.payload)

  const duplicate = reduce(initialEvent, {
    currentProjection: initial.projection,
    receiptExists: true,
  })
  assert.equal(duplicate.outcome, 'ignored_duplicate')
  assert.equal(duplicate.receipt, null)
  assert.equal(duplicate.projection, null)

  const staleEvent = eventAt('event-old', '2026-07-19T14:59:00.000000000Z')
  const stale = reduce(staleEvent, { currentProjection: initial.projection })
  assert.equal(stale.outcome, 'ignored_stale')
  assert.equal(stale.receipt?.outcome, 'ignored_stale')
  assert.equal(stale.projection, null)

  const sameTimeLater = reduce(
    eventAt('event-b', '2026-07-19T15:00:00.000000000Z'),
    { currentProjection: initial.projection }
  )
  assert.equal(sameTimeLater.outcome, 'applied')
  const sameTimeEarlier = reduce(
    eventAt('event-0', '2026-07-19T15:00:00.000000000Z'),
    { currentProjection: initial.projection }
  )
  assert.equal(sameTimeEarlier.outcome, 'ignored_stale')

  const retireEvent = eventAt(
    'event-retire',
    '2026-07-19T15:02:00.000000000Z',
    'retire'
  )
  const retirement = reduce(retireEvent, {
    currentProjection: initial.projection,
  })
  assert.equal(retirement.outcome, 'applied')
  assert.equal(retirement.projection?.state, 'retired')
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      retirement.projection || {},
      'payload'
    ),
    false
  )

  const staleResurrection = reduce(
    eventAt('event-resurrect-old', '2026-07-19T15:01:00.000000000Z'),
    { currentProjection: retirement.projection }
  )
  assert.equal(staleResurrection.outcome, 'ignored_stale')
  assert.equal(staleResurrection.projection, null)

  const revivalEvent = eventAt('event-revive', '2026-07-19T15:03:00.000000000Z')
  const revival = reduce(revivalEvent, {
    currentProjection: retirement.projection,
  })
  assert.equal(revival.outcome, 'applied')
  assert.equal(revival.projection?.state, 'active')
  assert.deepEqual(revival.projection?.payload, revivalEvent.payload)

  const wrongSourceEvent = structuredClone(initialEvent)
  wrongSourceEvent.source.database_id = 'other-database'
  const wrongSource = reduce(wrongSourceEvent)
  assert.equal(wrongSource.outcome, 'rejected')
  assert.equal(wrongSource.reason, 'source_mismatch')

  const wrongRelationEvent = structuredClone(initialEvent)
  wrongRelationEvent.payload.ecosystem_id = 'cleanbox'
  const wrongRelation = reduce(wrongRelationEvent)
  assert.equal(wrongRelation.outcome, 'rejected')
  assert.equal(wrongRelation.reason, 'app_ecosystem_mismatch')

  const futureEvent = structuredClone(rawUpsert)
  futureEvent.event_id = 'event-future'
  futureEvent.revision.source_event_time = '2026-07-19T16:06:00.000000000Z'
  assert.throws(
    () => validator.parseDirectoryPublicationV1(futureEvent, { nowMs }),
    /too far in the future/
  )
}

function runOwnerFixtures({ validator, owner }) {
  const config = {
    enabled: false,
    region: 'europe-west6',
    databaseId: 'misebox',
    outboxDatabaseId: 'directory-outbox',
    serviceAccount: 'directory-publisher@misebox-78f9c.iam.gserviceaccount.com',
    receiverUrl: '',
    oidcAudience: '',
    source: {
      firebase_project_id: 'misebox-78f9c',
      database_id: 'misebox',
      project_id: 'misebox',
      ecosystem_id: 'misebox',
    },
    allowedAppIds: ['misebox-app'],
    allowedEcosystemIds: ['misebox'],
  }
  const app = {
    project_id: 'misebox',
    ecosystem_id: 'misebox',
    slug: 'misebox-app',
    status: 'active',
    app_name: 'Misebox',
    app_short_name: 'Misebox',
    role: 'global',
    tagline: '',
    description: '',
    short_bio: '',
    derived: { user_count: 4 },
    media: {
      logo_url: '/img/app/logo.png',
      thumbnail_url: '/img/app/thumbnail.png',
      wordmark_light_url: '',
      wordmark_dark_url: '',
      cover_url: '',
    },
  }
  const base = {
    kind: 'app',
    entityId: 'misebox-app',
    cloudEventId: 'cloud-event-1',
    cloudEventSource: '//firestore.googleapis.com/projects/misebox-78f9c',
    cloudEventTime: '2026-07-19T15:00:00.123456789Z',
    beforeExists: false,
    afterExists: true,
    afterData: app,
    config,
  }
  const created = owner.buildDirectoryPublication(base)
  assert.equal(created?.action, 'upsert')
  assert.equal(
    created?.revision.source_event_time,
    '2026-07-19T15:00:00.123456789Z'
  )
  assert.doesNotThrow(() =>
    validator.parseDirectoryPublicationV1(created, {
      nowMs: Date.parse('2026-07-19T15:01:00.000Z'),
    })
  )

  const metadataOnly = owner.buildDirectoryPublication({
    ...base,
    beforeExists: true,
    beforeData: app,
    afterData: { ...app, admin_ids: ['private-admin'] },
  })
  assert.equal(metadataOnly, null)

  const retired = owner.buildDirectoryPublication({
    ...base,
    cloudEventId: 'cloud-event-2',
    beforeExists: true,
    beforeData: app,
    afterData: { ...app, status: 'archived' },
  })
  assert.equal(retired?.action, 'retire')

  const unlisted = owner.buildDirectoryPublication({
    ...base,
    entityId: 'unlisted-app',
  })
  assert.equal(unlisted, null)

  const functions = owner.createDirectoryPublisherFunctions(config)
  assert.deepEqual(Object.keys(functions).sort(), ['app', 'ecosystem'])
  assert.throws(
    () =>
      owner.createDirectoryPublisherFunctions({
        ...config,
        outboxDatabaseId: config.databaseId,
      }),
    /outbox database is not isolated/
  )
  assert.throws(
    () =>
      owner.createDirectoryPublisherFunctions({
        ...config,
        serviceAccount: 'default-compute@developer.gserviceaccount.com',
      }),
    /static identity is invalid/
  )

  const directConfig = {
    ...config,
    source: {
      firebase_project_id: 'fireux-2005',
      database_id: 'direct-app-db',
      project_id: 'direct-project',
    },
    databaseId: 'direct-app-db',
    serviceAccount: 'directory-publisher@fireux-2005.iam.gserviceaccount.com',
    allowedAppIds: ['direct-app'],
    allowedEcosystemIds: [],
  }
  const direct = owner.buildDirectoryPublication({
    ...base,
    entityId: 'direct-app',
    afterData: {
      ...app,
      project_id: 'direct-project',
      ecosystem_id: undefined,
      slug: 'direct-app',
    },
    config: directConfig,
  })
  assert.equal(direct?.action, 'upsert')
  assert.equal(direct?.payload.ecosystem_id, '')
}

function runBackfillFixtures() {
  const sourceOwner = {
    firebaseProjectId: 'misebox-78f9c',
    databaseId: 'misebox',
    projectId: 'misebox',
    ecosystemId: 'misebox',
  }
  const row = (id, classification, overrides = {}) => ({
    id,
    expectedOwner: sourceOwner,
    ownerExists: true,
    platformExists: true,
    classification,
    relationIssues: [],
    publicFieldDiffs: [],
    ownerPublicHash: `owner-${id}`,
    platformPublicHash: `platform-${id}`,
    publicValues: { owner: { secretMarker: 'must-not-leak' } },
    ...overrides,
  })
  const upsertClasses = [
    'MATCHED',
    'MISSING_PLATFORM',
    'PUBLIC_DRIFT',
    'DERIVED_COUNT_DRIFT',
  ]
  const blockedClasses = [
    'MISSING_OWNER',
    'RELATION_DRIFT',
    'OWNER_ID_UNRESOLVED',
    'ORPHAN_PLATFORM',
    'ORPHAN_OWNER',
    'UNREADABLE_OWNER',
    'UNREADABLE_PLATFORM',
    'AMBIGUOUS',
  ]
  const apps = [
    ...upsertClasses.map((classification, index) =>
      row(`upsert-${index}`, classification)
    ),
    ...blockedClasses.map((classification, index) =>
      row(`blocked-${index}`, classification, {
        ...(classification === 'MISSING_OWNER'
          ? { ownerExists: false, ownerPublicHash: '' }
          : {}),
      })
    ),
    row('relation-overrides-safe', 'MATCHED', {
      relationIssues: ['owner.project_id'],
    }),
  ]
  const ecosystems = [
    row('inactive-ecosystem', 'INACTIVE_OWNER', {
      expectedOwner: {
        firebaseProjectId: 'misebox-78f9c',
        databaseId: 'misebox',
        projectId: 'misebox',
      },
    }),
  ]
  const plan = buildPlatformDirectoryBackfillPlan(
    {
      contractVersion: 'platform-directory-reconciliation/v1',
      mode: 'read-only',
      generatedAt: '2026-07-19T15:00:00.000Z',
      apps,
      ecosystems,
      blockedTargets: [],
    },
    {
      generatedAt: '2026-07-19T16:00:00.000Z',
      sourceReportHash: 'fixture-hash',
    }
  )

  assert.equal(plan.mode, 'dry-run-disabled')
  assert.equal(plan.enabled, false)
  assert.equal(plan.summary.executionReady, false)
  assert.equal(plan.summary.actions.upsert, upsertClasses.length)
  assert.equal(plan.summary.actions.retire, 1)
  assert.deepEqual(
    plan.candidates
      .filter((candidate) => candidate.action === 'upsert')
      .map((candidate) => candidate.classification)
      .sort(),
    [...upsertClasses].sort()
  )
  assert.equal(
    plan.candidates.find(
      (candidate) => candidate.entity_id === 'inactive-ecosystem'
    )?.action,
    'retire'
  )
  assert.deepEqual(
    plan.blockers
      .filter((blocker) => blocker.entity_id.startsWith('blocked-'))
      .map((blocker) => blocker.classification)
      .sort(),
    [...blockedClasses].sort()
  )
  assert.equal(
    plan.blockers.find(
      (blocker) => blocker.entity_id === 'relation-overrides-safe'
    )?.reason,
    'canonical_relationship_drift'
  )
  assert.doesNotMatch(JSON.stringify(plan), /must-not-leak|publicValues/)
}

function runRemediationFixtures() {
  const rowFromDecision = (decision) => {
    const expected = decision.expected
    const source = expected.source
    return {
      id: decision.entity_id,
      classification: expected.classification,
      ownerExists: expected.owner_exists,
      platformExists: expected.platform_exists,
      ownerPublicHash: expected.owner_public_hash,
      platformPublicHash: expected.platform_public_hash,
      relationIssues: [...expected.relation_issues],
      publicFieldDiffs: [],
      expectedOwner: {
        firebaseProjectId: source.firebase_project_id,
        databaseId: source.database_id,
        projectId: source.project_id,
        ...(source.ecosystem_id ? { ecosystemId: source.ecosystem_id } : {}),
      },
    }
  }
  const report = {
    contractVersion: 'platform-directory-reconciliation/v1',
    mode: 'read-only',
    generatedAt: '2026-07-19T15:00:00.000Z',
    targets: [
      {
        firebase: { projectId: 'fireux-2005', databaseId: 'fireux' },
        usage: { platform: true },
      },
    ],
    apps: PLATFORM_DIRECTORY_REMEDIATION_DECISIONS.filter(
      (decision) => decision.entity_kind === 'app'
    ).map(rowFromDecision),
    ecosystems: PLATFORM_DIRECTORY_REMEDIATION_DECISIONS.filter(
      (decision) => decision.entity_kind === 'ecosystem'
    ).map(rowFromDecision),
    blockedTargets: [],
  }
  const options = {
    generatedAt: '2026-07-19T16:00:00.000Z',
    sourceReportHash: 'fixture-report-hash',
  }
  const plan = buildPlatformDirectoryRemediationPlan(report, options)

  assert.equal(plan.mode, 'dry-run-disabled')
  assert.equal(plan.enabled, false)
  assert.equal(plan.remoteWrites, false)
  assert.equal(plan.executionReady, false)
  assert.deepEqual(plan.summary, {
    decisions: 12,
    relationRepairs: 5,
    ownerBootstraps: 6,
    exclusions: 1,
    deduplicatedRelationTargets: 9,
    remoteWrites: false,
    executionReady: false,
  })
  assert.deepEqual(plan.exclusions.map((entry) => entry.entity_id).sort(), [
    'qrdoc',
  ])
  assert.doesNotMatch(
    JSON.stringify(plan),
    /logo_url|website_url|service_account|private_key|access_token/
  )

  const stale = structuredClone(report)
  stale.apps[0].ownerPublicHash = 'changed-owner-hash'
  assert.throws(
    () => buildPlatformDirectoryRemediationPlan(stale, options),
    /Stale owner public hash/
  )

  const missing = structuredClone(report)
  missing.apps.pop()
  assert.throws(
    () => buildPlatformDirectoryRemediationPlan(missing, options),
    /blocker set changed/
  )
}

function runRemediationExecutorFixtures() {
  assert.match(LOCKED_RECONCILIATION_SHA256, /^[a-f0-9]{64}$/)
  assert.equal(
    PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION,
    `APPLY_PLATFORM_DIRECTORY_REMEDIATION_${LOCKED_RECONCILIATION_SHA256.slice(0, 12)}`
  )
  assert.doesNotThrow(() =>
    assertApplyConfirmation({
      expectedHash: LOCKED_RECONCILIATION_SHA256,
      confirmation: PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION,
    })
  )
  assert.throws(
    () =>
      assertApplyConfirmation({
        expectedHash: 'changed',
        confirmation: PLATFORM_DIRECTORY_REMEDIATION_CONFIRMATION,
      }),
    /Reconciliation SHA-256 changed/
  )
  assert.throws(
    () =>
      assertApplyConfirmation({
        expectedHash: LOCKED_RECONCILIATION_SHA256,
        confirmation: 'wrong',
      }),
    /Apply requires --confirm/
  )
  assert.doesNotThrow(() =>
    assertCredentialFreeBackup({
      contractVersion: 'fixture/v1',
      writePreconditions: [{ entity_id: 'fixture' }],
    })
  )
  assert.throws(
    () => assertCredentialFreeBackup({ private_key: 'redacted' }),
    /Credential-like backup key rejected/
  )
}
