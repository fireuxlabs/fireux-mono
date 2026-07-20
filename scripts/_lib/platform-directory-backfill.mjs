// @fireux-script
// last_used: 2026-07-20
// usage_note: pure fail-closed reconciliation-to-backfill planning helpers.
// Concurrent edit — 2026-07-19 17:48 CEST — Directory Publication Pipeline: add a disabled reconciliation-to-backfill planner.
// Concurrent edit — 2026-07-20 11:26 CEST — Directory Live Provisioning Pass: record remediation precondition planning use.

export const PLATFORM_DIRECTORY_BACKFILL_PLAN_VERSION =
  'platform-directory-backfill-plan/v1'

const RECONCILIATION_CONTRACT_VERSION =
  'platform-directory-reconciliation/v1'

const UPSERT_CLASSIFICATIONS = new Set([
  'MATCHED',
  'MISSING_PLATFORM',
  'PUBLIC_DRIFT',
  'DERIVED_COUNT_DRIFT',
])

const text = (value) =>
  typeof value === 'string' ? value.trim() : ''

const record = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const strings = (value) =>
  Array.isArray(value) ? value.map(text).filter(Boolean) : []

const onePathSegment = (value) => {
  const normalized = text(value)
  return normalized && !normalized.includes('/') ? normalized : ''
}

function sourceFor(row, entityKind) {
  const owner = record(row.expectedOwner)
  const ecosystemId =
    entityKind === 'ecosystem'
      ? onePathSegment(row.id)
      : onePathSegment(owner.ecosystemId)

  return {
    firebase_project_id: text(owner.firebaseProjectId),
    database_id: onePathSegment(owner.databaseId),
    project_id: onePathSegment(owner.projectId),
    ...(ecosystemId ? { ecosystem_id: ecosystemId } : {}),
  }
}

function missingSourceFields(source) {
  return [
    ['firebase_project_id', source.firebase_project_id],
    ['database_id', source.database_id],
    ['project_id', source.project_id],
  ]
    .filter(([, value]) => !value)
    .map(([field]) => field)
}

function blockerReason(classification) {
  switch (classification) {
    case 'RELATION_DRIFT':
      return 'canonical_relationship_drift'
    case 'MISSING_OWNER':
      return 'canonical_owner_missing'
    case 'OWNER_ID_UNRESOLVED':
      return 'canonical_owner_unresolved'
    case 'ORPHAN_PLATFORM':
    case 'ORPHAN_OWNER':
      return 'orphan_requires_operator_decision'
    case 'UNREADABLE_OWNER':
    case 'UNREADABLE_PLATFORM':
      return 'reconciliation_source_unreadable'
    case 'AMBIGUOUS':
      return 'authority_ambiguous'
    default:
      return 'classification_not_safe_for_backfill'
  }
}

function planRow(rowValue, entityKind) {
  const row = record(rowValue)
  const entityId = onePathSegment(row.id)
  const classification = text(row.classification)
  const relationIssues = strings(row.relationIssues)
  const publicFieldDiffs = strings(row.publicFieldDiffs)
  const source = sourceFor(row, entityKind)
  const targetCollection =
    entityKind === 'app'
      ? 'directory-app-projections'
      : 'directory-ecosystem-projections'
  const common = {
    entity_kind: entityKind,
    entity_id: entityId || text(row.id),
    classification,
    source,
    target_path: entityId ? `${targetCollection}/${entityId}` : '',
    owner_exists: row.ownerExists === true,
    platform_exists: row.platformExists === true,
    owner_public_hash: text(row.ownerPublicHash),
    current_platform_public_hash: text(row.platformPublicHash),
    relation_issues: relationIssues,
    public_field_diffs: publicFieldDiffs,
  }

  if (!entityId) {
    return {
      kind: 'blocker',
      value: { ...common, reason: 'invalid_entity_id' },
    }
  }

  if (relationIssues.length) {
    return {
      kind: 'blocker',
      value: { ...common, reason: 'canonical_relationship_drift' },
    }
  }

  const action =
    classification === 'INACTIVE_OWNER'
      ? 'retire'
      : UPSERT_CLASSIFICATIONS.has(classification)
        ? 'upsert'
        : ''

  if (!action) {
    return {
      kind: 'blocker',
      value: { ...common, reason: blockerReason(classification) },
    }
  }

  if (row.ownerExists !== true) {
    return {
      kind: 'blocker',
      value: { ...common, reason: 'canonical_owner_missing' },
    }
  }

  const missingSource = missingSourceFields(source)
  if (missingSource.length) {
    return {
      kind: 'blocker',
      value: {
        ...common,
        reason: 'source_identity_incomplete',
        missing_source_fields: missingSource,
      },
    }
  }

  if (action === 'retire') {
    return {
      kind: 'candidate',
      value: {
        ...common,
        action: 'retire',
        reason: 'canonical_owner_inactive',
      },
    }
  }

  if (action === 'upsert') {
    if (!text(row.ownerPublicHash)) {
      return {
        kind: 'blocker',
        value: { ...common, reason: 'owner_projection_hash_missing' },
      }
    }

    return {
      kind: 'candidate',
      value: {
        ...common,
        action: 'upsert',
        reason: 'canonical_owner_projection',
      },
    }
  }

  throw new Error(`Unhandled backfill action: ${action}`)
}

function normalizeBlockedTargets(value) {
  if (!Array.isArray(value)) return []

  return value.map((targetValue) => {
    const target = record(targetValue)
    return {
      firebase_project_id: text(target.projectId),
      database_id: onePathSegment(target.databaseId),
      reason: 'reconciliation_target_blocked',
    }
  })
}

/**
 * Converts a read-only reconciliation snapshot into an informational plan.
 *
 * The result deliberately has no payloads, credentials, executable envelopes,
 * or mutation switch. It cannot be consumed as a write batch. A later,
 * separately reviewed executor must reread canonical owner truth and use the
 * authenticated publication transaction.
 */
export function buildPlatformDirectoryBackfillPlan(
  reportValue,
  {
    generatedAt = new Date().toISOString(),
    sourceReportHash = '',
  } = {}
) {
  const report = record(reportValue)
  if (text(report.contractVersion) !== RECONCILIATION_CONTRACT_VERSION) {
    throw new Error(
      `Expected ${RECONCILIATION_CONTRACT_VERSION} reconciliation input.`
    )
  }
  if (text(report.mode) !== 'read-only') {
    throw new Error('Backfill planning requires a read-only reconciliation input.')
  }
  if (!Array.isArray(report.apps) || !Array.isArray(report.ecosystems)) {
    throw new Error('Reconciliation input must contain App and Ecosystem rows.')
  }

  const candidates = []
  const blockers = []
  for (const [entityKind, rows] of [
    ['app', report.apps],
    ['ecosystem', report.ecosystems],
  ]) {
    for (const row of rows) {
      const planned = planRow(row, entityKind)
      if (planned.kind === 'candidate') candidates.push(planned.value)
      else blockers.push(planned.value)
    }
  }

  candidates.sort((left, right) =>
    `${left.entity_kind}/${left.entity_id}`.localeCompare(
      `${right.entity_kind}/${right.entity_id}`
    )
  )
  blockers.sort((left, right) =>
    `${left.entity_kind}/${left.entity_id}`.localeCompare(
      `${right.entity_kind}/${right.entity_id}`
    )
  )

  const blockedTargets = normalizeBlockedTargets(report.blockedTargets)
  const actionCounts = {
    upsert: candidates.filter((row) => row.action === 'upsert').length,
    retire: candidates.filter((row) => row.action === 'retire').length,
  }

  return {
    contractVersion: PLATFORM_DIRECTORY_BACKFILL_PLAN_VERSION,
    mode: 'dry-run-disabled',
    enabled: false,
    generatedAt: text(generatedAt),
    sourceReport: {
      contractVersion: text(report.contractVersion),
      generatedAt: text(report.generatedAt),
      sha256: text(sourceReportHash),
    },
    policy: {
      remoteReads: false,
      remoteWrites: false,
      legacyDeletes: false,
      curationWrites: false,
      publicPayloadsIncluded: false,
      nextGate:
        'authenticated publication receiver and canonical owner reread',
    },
    summary: {
      candidates: candidates.length,
      blockers: blockers.length,
      blockedTargets: blockedTargets.length,
      actions: actionCounts,
      executionReady: false,
    },
    candidates,
    blockers,
    blockedTargets,
  }
}
