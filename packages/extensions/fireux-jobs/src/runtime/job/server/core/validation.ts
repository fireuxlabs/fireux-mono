import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireFinancialMoney } from 'fireux-finance/runtime/utils/money'
import type {
  JobCreateIntent,
  JobMutableField,
  JobPatchIntent,
} from '../../models/job-author.model.ts'
import {
  JOB_CONTRACT_TYPES,
  JOB_MANAGEMENT_MODES,
  JOB_PAY_UNITS,
  JOB_STATUSES,
  type Job,
  type JobCompensation,
  type JobContractType,
  type JobManagementMode,
  type JobPayUnit,
  type JobStatus,
} from '../../models/job.model.ts'
import type { JobServerScope } from './runtime.ts'
import {
  assertJobSchedule,
  assertJobSchedule as assertSchedule,
  badJobRequest,
  jobSchemaError as schemaError,
  readCanonicalJobDocumentId as canonicalDocumentId,
  readCanonicalJobText as canonicalText,
  readCanonicalJobTimestamp as canonicalTimestamp,
  readJobCompensation,
  readJobDocumentId,
  readJobInteger,
  readJobText,
  readJobTimestamp,
  requireJobInputRecord,
  requireJobSchemaKeys as requireExactKeys,
  requireJobSchemaRecord as schemaRecord,
} from './validation-primitives.ts'

type JobCreateField = keyof JobCreateIntent

export const JOB_CREATE_FIELDS = [
  'company_id',
  'place_id',
  'category_id',
  'contract_type',
  'management_mode',
  'openings_count',
  'compensation',
  'start_at',
  'end_at',
  'title',
  'description',
] as const satisfies readonly JobCreateField[]

export const JOB_PATCH_FIELDS = [
  ...JOB_CREATE_FIELDS,
  'status',
] as const satisfies readonly JobMutableField[]

const createFieldSet = new Set<string>(JOB_CREATE_FIELDS)
const patchFieldSet = new Set<string>(JOB_PATCH_FIELDS)
const contractTypes = new Set<JobContractType>(JOB_CONTRACT_TYPES)
const managementModes = new Set<JobManagementMode>(JOB_MANAGEMENT_MODES)
const payUnits = new Set<JobPayUnit>(JOB_PAY_UNITS)
const statuses = new Set<JobStatus>(JOB_STATUSES)
const storedJobKeys = [
  'source_app_id',
  'source_ecosystem_id',
  'owner_type',
  'owner_id',
  'visibility',
  ...JOB_PATCH_FIELDS,
  'created',
  'updated',
] as const

function configuredCategoryIdentifier(
  value: unknown,
  scope: JobServerScope
): string {
  const id = readJobText(value, 'Job category', 120, true)
  if (!isFirestoreDocumentId(id)) badJobRequest('Job category is invalid.')
  if (scope.categoryScope === 'all') return id
  if (!scope.categories.size) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Job category configuration is unavailable.',
    })
  }
  if (!scope.categories.has(id)) {
    badJobRequest('Job category is not enabled for this App.')
  }
  return id
}

function enumValue<T extends string>(
  value: unknown,
  values: ReadonlySet<T>,
  label: string
): T {
  const normalized = readJobText(value, label, 80, true) as T
  if (!values.has(normalized)) badJobRequest(`${label} is invalid.`)
  return normalized
}

function normalizeCreateField(
  key: JobCreateField,
  value: unknown,
  scope: JobServerScope
): JobCreateIntent[JobCreateField] {
  switch (key) {
    case 'company_id':
      return readJobDocumentId(value, 'Company id')
    case 'place_id':
      return readJobDocumentId(value, 'Place id')
    case 'category_id':
      return configuredCategoryIdentifier(value, scope)
    case 'contract_type':
      return enumValue(value, contractTypes, 'Contract type')
    case 'management_mode':
      return enumValue(value, managementModes, 'Management mode')
    case 'openings_count':
      return readJobInteger(value, 'Openings count', 1, 500)
    case 'compensation':
      return readJobCompensation(value, badJobRequest)
    case 'start_at':
      return readJobTimestamp(value, 'Start time')
    case 'end_at':
      return readJobTimestamp(value, 'End time')
    case 'title':
      return readJobText(value, 'Job title', 240, true)
    case 'description':
      return readJobText(value, 'Job description', 8_000, true)
  }
}

function rejectUnsupportedKeys(
  source: Record<string, unknown>,
  allowed: ReadonlySet<string>
): void {
  const unsupported = Object.keys(source).find((key) => !allowed.has(key))
  if (unsupported) badJobRequest(`Unsupported Job field: ${unsupported}.`)
}

export function normalizeJobCreateIntent(
  value: unknown,
  scope: JobServerScope
): JobCreateIntent {
  const source = requireJobInputRecord(value)
  rejectUnsupportedKeys(source, createFieldSet)
  const normalized = Object.fromEntries(
    JOB_CREATE_FIELDS.map((key) => [
      key,
      normalizeCreateField(key, source[key], scope),
    ])
  ) as JobCreateIntent
  assertJobSchedule(
    normalized.contract_type,
    normalized.start_at,
    normalized.end_at,
    badJobRequest
  )
  return normalized
}

export function normalizeJobPatchIntent(
  value: unknown,
  scope: JobServerScope
): JobPatchIntent {
  const source = requireJobInputRecord(value)
  rejectUnsupportedKeys(source, patchFieldSet)
  const keys = Object.keys(source) as JobMutableField[]
  if (!keys.length) badJobRequest('A Job patch is required.')
  return Object.fromEntries(
    keys.map((key) => [
      key,
      key === 'status'
        ? enumValue(source[key], statuses, 'Job status')
        : normalizeCreateField(key, source[key], scope),
    ])
  ) as JobPatchIntent
}

export function jobCreateFields(
  value: Record<string, unknown>
): JobCreateIntent {
  return Object.fromEntries(
    JOB_CREATE_FIELDS.map((key) => [key, value[key]])
  ) as JobCreateIntent
}

function canonicalCompensation(value: unknown): JobCompensation | null {
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    schemaError('Compensation must be null or an object.')
  }
  const source = value as Record<string, unknown>
  const keys = Object.keys(source).sort()
  if (keys.join() !== 'amount_minor,currency_code,unit') {
    schemaError(
      'Compensation must contain only amount_minor, currency_code, and unit.'
    )
  }
  const unit = String(source.unit ?? '') as JobPayUnit
  if (!payUnits.has(unit)) schemaError('Compensation unit is invalid.')
  try {
    return {
      ...requireFinancialMoney(
        {
          amount_minor: source.amount_minor,
          currency_code: source.currency_code,
        },
        {
          allowNegative: false,
          allowZero: false,
          label: 'Job compensation',
        }
      ),
      unit,
    }
  } catch (error) {
    schemaError(
      error instanceof Error ? error.message : 'Compensation is invalid.'
    )
  }
}

function canonicalStamp(
  value: unknown,
  label: 'created' | 'updated'
): Job['created'] | Job['updated'] {
  const source = schemaRecord(value, `${label} stamp`)
  const keys = label === 'created' ? ['at', 'by', 'app_id'] : ['at', 'by']
  requireExactKeys(source, keys, `${label} stamp`)
  const at = canonicalTimestamp(source.at, `${label}.at`, false)
  const by = canonicalDocumentId(source.by, `${label}.by`)
  if (label === 'created') {
    return {
      at: at as NonNullable<Job['created']['at']>,
      by,
      app_id: canonicalDocumentId(source.app_id, 'created.app_id'),
    }
  }
  return { at: at as NonNullable<Job['updated']['at']>, by }
}

/** Exact canonical parser for every trusted raw Job read. */
export function canonicalJobRoot(id: string, value: unknown): Job {
  const source = schemaRecord(value, 'Job root')
  requireExactKeys(source, storedJobKeys, 'Job root')
  const sourceAppId = canonicalDocumentId(source.source_app_id, 'source_app_id')
  const sourceEcosystemId = canonicalText(
    source.source_ecosystem_id,
    'source_ecosystem_id',
    1_500,
    false
  )
  if (sourceEcosystemId && !isFirestoreDocumentId(sourceEcosystemId)) {
    schemaError('source_ecosystem_id is invalid.')
  }
  if (source.owner_type !== 'user') schemaError('owner_type must be user.')
  const visibility = source.visibility
  if (visibility !== 'app' && visibility !== 'public') {
    schemaError('visibility must be app or public.')
  }
  const contractType = source.contract_type as JobContractType
  if (!contractTypes.has(contractType)) schemaError('contract_type is invalid.')
  const managementMode = source.management_mode as JobManagementMode
  if (!managementModes.has(managementMode)) {
    schemaError('management_mode is invalid.')
  }
  const openingsCount = source.openings_count
  if (
    typeof openingsCount !== 'number' ||
    !Number.isInteger(openingsCount) ||
    openingsCount < 1 ||
    openingsCount > 500
  ) {
    schemaError('openings_count is invalid.')
  }
  const startAt = canonicalTimestamp(source.start_at, 'start_at', true)
  const endAt = canonicalTimestamp(source.end_at, 'end_at', true)
  assertSchedule(contractType, startAt, endAt, schemaError)
  const status = source.status as JobStatus
  if (!statuses.has(status)) schemaError('status is invalid.')
  return {
    id: canonicalDocumentId(id, 'id'),
    source_app_id: sourceAppId,
    source_ecosystem_id: sourceEcosystemId,
    owner_type: 'user',
    owner_id: canonicalDocumentId(source.owner_id, 'owner_id'),
    visibility,
    company_id: canonicalDocumentId(source.company_id, 'company_id'),
    place_id: canonicalDocumentId(source.place_id, 'place_id'),
    category_id: canonicalDocumentId(source.category_id, 'category_id'),
    contract_type: contractType,
    management_mode: managementMode,
    openings_count: openingsCount,
    compensation: canonicalCompensation(source.compensation),
    start_at: startAt,
    end_at: endAt,
    title: canonicalText(source.title, 'title', 240),
    description: canonicalText(source.description, 'description', 8_000),
    status,
    created: canonicalStamp(source.created, 'created') as Job['created'],
    updated: canonicalStamp(source.updated, 'updated') as Job['updated'],
  }
}

export type JobReference = { path: string; label: string }

export function jobReferences(job: JobCreateIntent): JobReference[] {
  const references = [
    { path: `places/${job.place_id}`, label: 'Job Place' },
    { path: `companies/${job.company_id}`, label: 'Company' },
    { path: `places/${job.company_id}`, label: 'Company Place' },
  ]
  return Array.from(
    new Map(references.map((reference) => [reference.path, reference])).values()
  )
}
