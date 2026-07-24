// @fireux-script
// last_used: 2026-07-21
// usage_note: provide the immutable resolution matrix and pure no-write directory remediation planner.
// Concurrent edit — 2026-07-21 12:33 CEST — Cleanbox-to-Werkbox migration: keep the historical cleanbox decision bound to current local authority sources.
// Concurrent edit — 2026-07-19 22:12 CEST — Directory Remediation Pass: lock the blocker resolutions into a fail-closed no-write plan.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: reuse locked decisions as live write preconditions.

import { isDeepStrictEqual } from 'node:util'
import { buildPlatformDirectoryBackfillPlan } from './platform-directory-backfill.mjs'

export const PLATFORM_DIRECTORY_REMEDIATION_VERSION =
  'platform-directory-remediation/v1'

const RECONCILIATION_VERSION = 'platform-directory-reconciliation/v1'
const PLATFORM_TARGET = {
  firebase_project_id: 'fireux-2005',
  database_id: 'fireux',
}

const APP_REGISTRY_PATH = 'scripts/_lib/app-registry.mjs'
const APP_ENSURE_CONTRACT_PATH =
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/appEnsurePayload.ts'
const APP_CREATE_CONTRACT_PATH =
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppCreate.ts'
const ECOSYSTEM_CREATE_CONTRACT_PATH =
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/mutations/useEcosystemCreate.ts'

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value)) deepFreeze(child)
  return Object.freeze(value)
}

export const PLATFORM_DIRECTORY_REMEDIATION_DECISIONS = deepFreeze([
  {
    entity_kind: 'app',
    entity_id: 'bangin-coffee',
    resolution: 'bootstrap_owner',
    expected: {
      classification: 'MISSING_OWNER',
      owner_exists: false,
      platform_exists: false,
      owner_public_hash: '',
      platform_public_hash: '',
      relation_issues: [],
      source: {
        firebase_project_id: 'misebox-78f9c',
        database_id: 'misebox',
        project_id: 'misebox',
        ecosystem_id: 'misebox',
      },
    },
    authoritative_inputs: [
      'projects/misebox/bangin-coffee/nuxt.config.ts',
      APP_REGISTRY_PATH,
      APP_CREATE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'buenohost',
    resolution: 'repair_relation',
    expected: {
      classification: 'RELATION_DRIFT',
      owner_exists: true,
      platform_exists: true,
      owner_public_hash:
        'b737efc611b2102fcc04002c864ab2c3e2e5179dfcb46fa0e12b7d16faa48390',
      platform_public_hash:
        'b737efc611b2102fcc04002c864ab2c3e2e5179dfcb46fa0e12b7d16faa48390',
      relation_issues: ['owner.ecosystem_id', 'platform.ecosystem_id'],
      source: {
        firebase_project_id: 'fireux-2005',
        database_id: 'buenohost',
        project_id: 'fireux',
      },
    },
    authoritative_inputs: [
      'projects/fireux/buenohost/nuxt.config.ts',
      APP_ENSURE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'find-my-seo-app',
    resolution: 'repair_relation',
    expected: {
      classification: 'RELATION_DRIFT',
      owner_exists: true,
      platform_exists: true,
      owner_public_hash:
        '2ccbc15739967227c9b8c200974543d6e2db11c03a78bcde2437430e9ea70dad',
      platform_public_hash:
        'fc81791e5a50d9c5f70971dbcf0b7bcb05eac96b3930c0017f61880abf488180',
      relation_issues: ['owner.ecosystem_id', 'platform.ecosystem_id'],
      source: {
        firebase_project_id: 'fireux-2005',
        database_id: 'find-my-seo',
        project_id: 'fireux',
      },
    },
    authoritative_inputs: [
      'projects/fireux/find-my-seo-app/nuxt.config.ts',
      APP_ENSURE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'fireux-blank',
    resolution: 'repair_relation',
    expected: {
      classification: 'RELATION_DRIFT',
      owner_exists: true,
      platform_exists: true,
      owner_public_hash:
        '1b5b0ffd80d71fc4dbe70109aa101cf449f8627cc5e6a93ed546af320685eaf1',
      platform_public_hash:
        '1b5b0ffd80d71fc4dbe70109aa101cf449f8627cc5e6a93ed546af320685eaf1',
      relation_issues: ['owner.ecosystem_id', 'platform.ecosystem_id'],
      source: {
        firebase_project_id: 'fireux-2005',
        database_id: 'fireux',
        project_id: 'fireux',
      },
    },
    authoritative_inputs: [
      'projects/fireux/fireux-blank/nuxt.config.ts',
      APP_ENSURE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'go-qr',
    resolution: 'repair_relation',
    expected: {
      classification: 'RELATION_DRIFT',
      owner_exists: true,
      platform_exists: true,
      owner_public_hash:
        '9e4b49e795c06419aec122716d9309ce674d88dae39f7705b8dbde3592a1e157',
      platform_public_hash:
        '9e4b49e795c06419aec122716d9309ce674d88dae39f7705b8dbde3592a1e157',
      relation_issues: ['owner.ecosystem_id', 'platform.ecosystem_id'],
      source: {
        firebase_project_id: 'fireux-2005',
        database_id: 'go-qr',
        project_id: 'fireux',
      },
    },
    authoritative_inputs: [
      'projects/fireux/go-qr/nuxt.config.ts',
      APP_ENSURE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'qrdoc',
    resolution: 'exclude_from_backfill',
    exclusion_reason: 'legacy_projection_without_current_app_authority',
    expected: {
      classification: 'ORPHAN_PLATFORM',
      owner_exists: false,
      platform_exists: true,
      owner_public_hash: '',
      platform_public_hash:
        '073a64920282ece258abb04d7490b0c56142de34241ea16dc295020c8de5e3fb',
      relation_issues: [],
      source: {
        firebase_project_id: '',
        database_id: '',
        project_id: '',
      },
    },
    authoritative_inputs: [
      APP_REGISTRY_PATH,
      'projects/fireux/go-qr/nuxt.config.ts',
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'sproochli',
    resolution: 'repair_relation',
    expected: {
      classification: 'RELATION_DRIFT',
      owner_exists: true,
      platform_exists: true,
      owner_public_hash:
        'fbefa06815547ddc9e82fcb08d999d31ce2d0cdeb74d7a2b3b5f59bffe4b0495',
      platform_public_hash:
        'fbefa06815547ddc9e82fcb08d999d31ce2d0cdeb74d7a2b3b5f59bffe4b0495',
      relation_issues: ['owner.ecosystem_id', 'platform.ecosystem_id'],
      source: {
        firebase_project_id: 'fireux-2005',
        database_id: 'sproochli',
        project_id: 'fireux',
      },
    },
    authoritative_inputs: [
      'projects/fireux/sproochli/nuxt.config.ts',
      APP_ENSURE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'app',
    entity_id: 'yellow-velo',
    resolution: 'bootstrap_owner',
    expected: {
      classification: 'MISSING_OWNER',
      owner_exists: false,
      platform_exists: false,
      owner_public_hash: '',
      platform_public_hash: '',
      relation_issues: [],
      source: {
        firebase_project_id: 'slap-45389',
        database_id: 'slap',
        project_id: 'slap',
        ecosystem_id: 'slap',
      },
    },
    authoritative_inputs: [
      'projects/slap/yellow-velo/nuxt.config.ts',
      APP_REGISTRY_PATH,
      APP_CREATE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'ecosystem',
    entity_id: 'bringli',
    resolution: 'bootstrap_owner',
    expected: {
      classification: 'MISSING_OWNER',
      owner_exists: false,
      platform_exists: true,
      owner_public_hash: '',
      platform_public_hash:
        'b90872a69cfd13244f83208e502e32f2c079709c60b1c70ba687ca826b090d8a',
      relation_issues: [],
      source: {
        firebase_project_id: 'bringli-b0517',
        database_id: 'bringli',
        project_id: 'bringli',
        ecosystem_id: 'bringli',
      },
    },
    authoritative_inputs: [
      'packages/ecosystem/fireux-bringli/src/config/firebase/ecosystem.config.ts',
      'packages/ecosystem/fireux-bringli/.firebaserc',
      'projects/bringli/bringli-app/nuxt.config.ts',
      ECOSYSTEM_CREATE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'ecosystem',
    entity_id: 'cleanbox',
    resolution: 'bootstrap_owner',
    expected: {
      classification: 'MISSING_OWNER',
      owner_exists: false,
      platform_exists: true,
      owner_public_hash: '',
      platform_public_hash:
        'b7d5a542144d3ceec60e68e371d94b2447a9d601ab6528fbba57f5652bd1d9f7',
      relation_issues: [],
      source: {
        firebase_project_id: 'cleanbox-f15bc',
        database_id: 'cleanbox',
        project_id: 'cleanbox',
        ecosystem_id: 'cleanbox',
      },
    },
    authoritative_inputs: [
      'packages/ecosystem/fireux-werkbox/src/config/firebase/ecosystem.config.ts',
      'packages/ecosystem/fireux-werkbox/.firebaserc',
      'projects/werkbox/werkbox-app/nuxt.config.ts',
      ECOSYSTEM_CREATE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'ecosystem',
    entity_id: 'granite',
    resolution: 'bootstrap_owner',
    expected: {
      classification: 'MISSING_OWNER',
      owner_exists: false,
      platform_exists: true,
      owner_public_hash: '',
      platform_public_hash:
        'fc6767094c909c70b05796341a9c2e8d49a30ee64de7e4e55ff67a11c1198e94',
      relation_issues: [],
      source: {
        firebase_project_id: 'granite-ecosystem',
        database_id: 'granite',
        project_id: 'granite',
        ecosystem_id: 'granite',
      },
    },
    authoritative_inputs: [
      'packages/ecosystem/fireux-granite/src/config/firebase/ecosystem.config.ts',
      'packages/ecosystem/fireux-granite/.firebaserc',
      'projects/granite/granite-app/nuxt.config.ts',
      ECOSYSTEM_CREATE_CONTRACT_PATH,
    ],
  },
  {
    entity_kind: 'ecosystem',
    entity_id: 'misebox',
    resolution: 'bootstrap_owner',
    expected: {
      classification: 'MISSING_OWNER',
      owner_exists: false,
      platform_exists: true,
      owner_public_hash: '',
      platform_public_hash:
        'b3f9558f68f1fde82c3c402a74a99ca4e7e0a3fde34094ff143531ad389c9c1c',
      relation_issues: [],
      source: {
        firebase_project_id: 'misebox-78f9c',
        database_id: 'misebox',
        project_id: 'misebox',
        ecosystem_id: 'misebox',
      },
    },
    authoritative_inputs: [
      'packages/ecosystem/fireux-misebox/src/config/firebase/ecosystem.config.ts',
      'packages/ecosystem/fireux-misebox/.firebaserc',
      'projects/misebox/misebox-app/nuxt.config.ts',
      ECOSYSTEM_CREATE_CONTRACT_PATH,
    ],
  },
])

const text = (value) => (typeof value === 'string' ? value.trim() : '')

const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const strings = (value) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

const entityKey = (value) =>
  `${text(value?.entity_kind)}/${text(value?.entity_id)}`

const targetKey = (target) =>
  [
    text(target.firebase_project_id),
    text(target.database_id),
    text(target.document_path),
  ].join('/')

function assertResolutionMatrix() {
  const allowedResolutions = new Set([
    'repair_relation',
    'bootstrap_owner',
    'exclude_from_backfill',
  ])
  const allowedClassifications = {
    repair_relation: new Set(['RELATION_DRIFT']),
    bootstrap_owner: new Set(['MISSING_OWNER']),
    exclude_from_backfill: new Set([
      'OWNER_ID_UNRESOLVED',
      'ORPHAN_PLATFORM',
    ]),
  }
  const expectedCounts = {
    repair_relation: 5,
    bootstrap_owner: 6,
    exclude_from_backfill: 1,
  }
  const seen = new Set()
  const counts = Object.fromEntries(
    [...allowedResolutions].map((resolution) => [resolution, 0])
  )

  for (const decision of PLATFORM_DIRECTORY_REMEDIATION_DECISIONS) {
    const key = entityKey(decision)
    if (!['app', 'ecosystem'].includes(text(decision.entity_kind))) {
      throw new Error(`Invalid remediation entity kind for ${key}.`)
    }
    if (!text(decision.entity_id) || text(decision.entity_id).includes('/')) {
      throw new Error(`Invalid remediation entity ID for ${key}.`)
    }
    if (seen.has(key)) throw new Error(`Duplicate remediation decision: ${key}`)
    seen.add(key)

    const resolution = text(decision.resolution)
    if (!allowedResolutions.has(resolution)) {
      throw new Error(`Invalid remediation resolution for ${key}.`)
    }
    counts[resolution] += 1

    const classification = text(decision.expected?.classification)
    if (!allowedClassifications[resolution].has(classification)) {
      throw new Error(
        `Classification ${classification || '(empty)'} cannot use ${resolution} for ${key}.`
      )
    }
    if (!Array.isArray(decision.authoritative_inputs)) {
      throw new Error(`Authoritative inputs are missing for ${key}.`)
    }
  }

  if (
    PLATFORM_DIRECTORY_REMEDIATION_DECISIONS.length !== 12 ||
    !isDeepStrictEqual(counts, expectedCounts)
  ) {
    throw new Error(
      `Expected exactly 12 decisions (5 relation repairs, 6 owner bootstraps, 1 exclusion); received ${JSON.stringify(counts)}.`
    )
  }
}

function platformTargetFrom(report) {
  const targets = Array.isArray(report.targets) ? report.targets : []
  const platformTargets = targets.filter(
    (target) => record(target).usage?.platform === true
  )
  if (platformTargets.length !== 1) {
    throw new Error(
      `Expected exactly one platform reconciliation target; received ${platformTargets.length}.`
    )
  }

  const firebase = record(platformTargets[0].firebase)
  const result = {
    firebase_project_id: text(firebase.projectId),
    database_id: text(firebase.databaseId),
  }
  if (!isDeepStrictEqual(result, PLATFORM_TARGET)) {
    throw new Error(
      `Platform target changed: expected ${targetKey({ ...PLATFORM_TARGET, document_path: '' })}.`
    )
  }
  return result
}

function blockerMapFrom(report, options) {
  const backfill = buildPlatformDirectoryBackfillPlan(report, options)
  if (backfill.blockedTargets.length) {
    throw new Error(
      'Remediation planning requires zero blocked reconciliation targets.'
    )
  }

  const blockers = new Map()
  for (const blocker of backfill.blockers) {
    const key = entityKey(blocker)
    if (blockers.has(key)) {
      throw new Error(`Duplicate reconciliation blocker: ${key}`)
    }
    blockers.set(key, blocker)
  }
  return blockers
}

function assertExactBlockerSet(blockers) {
  const expectedKeys = PLATFORM_DIRECTORY_REMEDIATION_DECISIONS.map(entityKey)
  const missing = expectedKeys.filter((key) => !blockers.has(key)).sort()
  const extra = [...blockers.keys()]
    .filter((key) => !expectedKeys.includes(key))
    .sort()

  if (missing.length || extra.length) {
    throw new Error(
      `Reconciliation blocker set changed (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}).`
    )
  }
}

function assertBlockerPrecondition(decision, blocker) {
  const key = entityKey(decision)
  const expected = decision.expected
  const checks = [
    ['classification', text(blocker.classification), text(expected.classification)],
    ['owner existence', blocker.owner_exists === true, expected.owner_exists],
    [
      'platform existence',
      blocker.platform_exists === true,
      expected.platform_exists,
    ],
    [
      'owner public hash',
      text(blocker.owner_public_hash),
      text(expected.owner_public_hash),
    ],
    [
      'platform public hash',
      text(blocker.current_platform_public_hash),
      text(expected.platform_public_hash),
    ],
  ]

  for (const [label, actual, wanted] of checks) {
    if (actual !== wanted) {
      throw new Error(
        `Stale ${label} for ${key}: expected ${JSON.stringify(wanted)}, received ${JSON.stringify(actual)}.`
      )
    }
  }

  const relationIssues = strings(blocker.relation_issues).sort()
  const expectedRelationIssues = strings(expected.relation_issues).sort()
  if (!isDeepStrictEqual(relationIssues, expectedRelationIssues)) {
    throw new Error(`Stale relation issues for ${key}.`)
  }
  if (!isDeepStrictEqual(record(blocker.source), record(expected.source))) {
    throw new Error(`Stale canonical source identity for ${key}.`)
  }
}

function safeDecision(decision, blocker) {
  return {
    entity_kind: decision.entity_kind,
    entity_id: decision.entity_id,
    resolution: decision.resolution,
    authoritative_inputs: [...decision.authoritative_inputs],
    precondition: {
      classification: blocker.classification,
      owner_exists: blocker.owner_exists,
      platform_exists: blocker.platform_exists,
      owner_public_hash: blocker.owner_public_hash,
      platform_public_hash: blocker.current_platform_public_hash,
      relation_issues: [...blocker.relation_issues],
      source: { ...blocker.source },
    },
    live_resolution_requires_remote_write:
      decision.resolution !== 'exclude_from_backfill',
  }
}

function buildRepairTargets(decisions, platformTarget) {
  const targets = new Map()

  for (const decision of decisions) {
    if (decision.resolution !== 'repair_relation') continue
    const source = decision.precondition.source
    const candidates = [
      {
        role: 'canonical_owner',
        firebase_project_id: source.firebase_project_id,
        database_id: source.database_id,
      },
      {
        role: 'legacy_platform',
        ...platformTarget,
      },
    ]

    for (const candidate of candidates) {
      const target = {
        firebase_project_id: candidate.firebase_project_id,
        database_id: candidate.database_id,
        document_path: `apps/${decision.entity_id}`,
      }
      const key = targetKey(target)
      const existing = targets.get(key)
      if (existing) {
        if (!existing.target_roles.includes(candidate.role)) {
          existing.target_roles.push(candidate.role)
          existing.target_roles.sort()
        }
        continue
      }

      targets.set(key, {
        entity_kind: decision.entity_kind,
        entity_id: decision.entity_id,
        target,
        target_roles: [candidate.role],
        relationship_assertions: {
          project_id: source.project_id,
        },
        remove_fields: ['ecosystem_id'],
        remote_write_required: true,
        execution_ready: false,
      })
    }
  }

  return [...targets.values()].sort((left, right) =>
    targetKey(left.target).localeCompare(targetKey(right.target))
  )
}

function buildOwnerBootstraps(decisions) {
  return decisions
    .filter((decision) => decision.resolution === 'bootstrap_owner')
    .map((decision) => {
      const source = decision.precondition.source
      const collection = decision.entity_kind === 'app' ? 'apps' : 'ecosystems'
      const relationship = {
        project_id: source.project_id,
        ...(decision.entity_kind === 'app' && source.ecosystem_id
          ? { ecosystem_id: source.ecosystem_id }
          : {}),
      }

      return {
        entity_kind: decision.entity_kind,
        entity_id: decision.entity_id,
        target: {
          firebase_project_id: source.firebase_project_id,
          database_id: source.database_id,
          document_path: `${collection}/${decision.entity_id}`,
        },
        relationship_contract: relationship,
        authoritative_inputs: [...decision.authoritative_inputs],
        bootstrap_payload_included: false,
        remote_write_required: true,
        execution_ready: false,
      }
    })
    .sort((left, right) => entityKey(left).localeCompare(entityKey(right)))
}

function buildExclusions(decisions) {
  return decisions
    .filter((decision) => decision.resolution === 'exclude_from_backfill')
    .map((decision) => ({
      entity_kind: decision.entity_kind,
      entity_id: decision.entity_id,
      reason: decision.exclusion_reason,
      scope: 'new_platform_directory_backfill',
      canonical_owner_delete_planned: false,
      legacy_platform_delete_planned: false,
      remote_write_required: false,
      execution_ready: false,
      authoritative_inputs: [...decision.authoritative_inputs],
    }))
    .sort((left, right) => entityKey(left).localeCompare(entityKey(right)))
}

/**
 * Resolves the known reconciliation blockers into a non-executable local plan.
 *
 * The plan contains only identities, relationships, field names, source paths,
 * and projection hashes. It deliberately contains no public payload values,
 * credentials, token URLs, Firebase mutations, or executable write envelope.
 */
export function buildPlatformDirectoryRemediationPlan(
  reportValue,
  {
    generatedAt = new Date().toISOString(),
    sourceReportHash = '',
  } = {}
) {
  assertResolutionMatrix()

  const report = record(reportValue)
  if (text(report.contractVersion) !== RECONCILIATION_VERSION) {
    throw new Error(`Expected ${RECONCILIATION_VERSION} reconciliation input.`)
  }
  if (text(report.mode) !== 'read-only') {
    throw new Error('Remediation planning requires a read-only reconciliation input.')
  }
  if (!Array.isArray(report.apps) || !Array.isArray(report.ecosystems)) {
    throw new Error('Reconciliation input must contain App and Ecosystem rows.')
  }

  const platformTarget = platformTargetFrom(report)
  const blockers = blockerMapFrom(report, {
    generatedAt,
    sourceReportHash,
  })
  assertExactBlockerSet(blockers)

  const decisions = PLATFORM_DIRECTORY_REMEDIATION_DECISIONS.map((decision) => {
    const blocker = blockers.get(entityKey(decision))
    assertBlockerPrecondition(decision, blocker)
    return safeDecision(decision, blocker)
  })
  const repairTargets = buildRepairTargets(decisions, platformTarget)
  const ownerBootstraps = buildOwnerBootstraps(decisions)
  const exclusions = buildExclusions(PLATFORM_DIRECTORY_REMEDIATION_DECISIONS)

  if (repairTargets.length !== 9) {
    throw new Error(
      `Expected 9 deduplicated physical relation targets; received ${repairTargets.length}.`
    )
  }

  return {
    contractVersion: PLATFORM_DIRECTORY_REMEDIATION_VERSION,
    mode: 'dry-run-disabled',
    enabled: false,
    generatedAt: text(generatedAt),
    remoteWrites: false,
    executionReady: false,
    sourceReport: {
      contractVersion: text(report.contractVersion),
      generatedAt: text(report.generatedAt),
      sha256: text(sourceReportHash),
    },
    platformTarget,
    policy: {
      remoteReads: false,
      remoteWrites: false,
      executionReady: false,
      publicValuesIncluded: false,
      credentialsIncluded: false,
      tokenUrlsIncluded: false,
      legacyDeletes: false,
      curationWrites: false,
      nextGate: 'separately reviewed dry-run-first write executor',
    },
    summary: {
      decisions: decisions.length,
      relationRepairs: decisions.filter(
        (decision) => decision.resolution === 'repair_relation'
      ).length,
      ownerBootstraps: ownerBootstraps.length,
      exclusions: exclusions.length,
      deduplicatedRelationTargets: repairTargets.length,
      remoteWrites: false,
      executionReady: false,
    },
    decisions,
    repairTargets,
    ownerBootstraps,
    exclusions,
  }
}
