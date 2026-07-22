// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: normalize bounded product-neutral Job authoring intents.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: exact-validate roots, safe intents, Place references, schedules, and compensation.
import { Timestamp } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { requireFinancialMoney } from 'fireux-finance/runtime/utils/money.ts'
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

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function schemaError(message: string): never {
  throw new Error(`Canonical Job is invalid: ${message}`)
}

function record(value: unknown, label = 'Job input'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function schemaRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    schemaError(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
}

function requireExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  label: string
): void {
  if (!hasExactKeys(value, keys)) schemaError(`${label} has unsupported or missing fields.`)
}

function text(
  value: unknown,
  label: string,
  maxLength: number,
  required = false
): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (required && !normalized) badRequest(`${label} is required.`)
  if (normalized.length > maxLength) {
    badRequest(`${label} must be ${maxLength} characters or less.`)
  }
  return normalized
}

function canonicalText(
  value: unknown,
  label: string,
  maxLength: number,
  required = true
): string {
  if (typeof value !== 'string') schemaError(`${label} must be a string.`)
  const normalized = value.trim()
  if (required && !normalized) schemaError(`${label} is required.`)
  if (normalized !== value || normalized.length > maxLength) {
    schemaError(`${label} is not canonical.`)
  }
  return normalized
}

function documentId(value: unknown, label: string): string {
  const id = text(value, label, 1_500, true)
  if (!isFirestoreDocumentId(id)) badRequest(`${label} is invalid.`)
  return id
}

function canonicalDocumentId(value: unknown, label: string): string {
  const id = canonicalText(value, label, 1_500)
  if (!isFirestoreDocumentId(id)) schemaError(`${label} is invalid.`)
  return id
}

function integer(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number
): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    badRequest(`${label} must be an integer from ${minimum} to ${maximum}.`)
  }
  return value
}

type TimestampParts = {
  seconds: number
  nanoseconds: number
}

function timestampParts(value: unknown): TimestampParts | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const seconds = source.seconds ?? source._seconds
  const nanoseconds = source.nanoseconds ?? source._nanoseconds ?? 0
  if (
    typeof seconds !== 'number' ||
    !Number.isInteger(seconds) ||
    typeof nanoseconds !== 'number' ||
    !Number.isInteger(nanoseconds) ||
    nanoseconds < 0 ||
    nanoseconds >= 1_000_000_000
  ) {
    return null
  }
  return { seconds, nanoseconds }
}

function timestamp(value: unknown, label: string): Job['start_at'] {
  if (value === null) return null
  if (value instanceof Timestamp) return value as unknown as Job['start_at']
  const parts = timestampParts(value)
  if (!parts) badRequest(`${label} must be null or a valid timestamp.`)
  return new Timestamp(parts.seconds, parts.nanoseconds) as unknown as Job['start_at']
}

function canonicalTimestamp(
  value: unknown,
  label: string,
  nullable: boolean
): Job['start_at'] {
  if (value === null && nullable) return null
  if (value instanceof Timestamp) {
    return value as Job['start_at']
  }
  schemaError(`${label} must be ${nullable ? 'null or ' : ''}a valid timestamp.`)
}

function compareTimestamps(
  left: NonNullable<Job['start_at']>,
  right: NonNullable<Job['start_at']>
): number {
  const leftParts = timestampParts(left)
  const rightParts = timestampParts(right)
  if (!leftParts || !rightParts) schemaError('schedule timestamps are invalid.')
  return leftParts.seconds - rightParts.seconds ||
    leftParts.nanoseconds - rightParts.nanoseconds
}

function assertSchedule(
  contractType: JobContractType,
  startAt: Job['start_at'],
  endAt: Job['end_at'],
  fail: (message: string) => never
): void {
  if (contractType === 'fixed_term' && (!startAt || !endAt)) {
    fail('Fixed-term Jobs require both a start and end time.')
  }
  if (contractType === 'permanent' && endAt) {
    fail('Permanent Jobs cannot have an end time.')
  }
  if (endAt && !startAt) {
    fail('An end time requires a start time.')
  }
  if (startAt && endAt && compareTimestamps(startAt, endAt) >= 0) {
    fail('End time must be after start time.')
  }
}

function compensation(
  value: unknown,
  fail: (message: string) => never
): JobCompensation | null {
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('Compensation must be null or an object.')
  }
  const source = value as Record<string, unknown>
  if (!hasExactKeys(source, ['amount_minor', 'currency_code', 'unit'])) {
    fail('Compensation must contain only amount_minor, currency_code, and unit.')
  }
  const unit = String(source.unit ?? '') as JobPayUnit
  if (!payUnits.has(unit)) fail('Compensation unit is invalid.')

  try {
    const money = requireFinancialMoney(
      {
        amount_minor: source.amount_minor,
        currency_code: source.currency_code,
      },
      {
        allowNegative: false,
        allowZero: false,
        label: 'Job compensation',
      }
    )
    return { ...money, unit }
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Compensation is invalid.')
  }
}

function configuredIdentifier(
  value: unknown,
  allowed: ReadonlySet<string>,
  label: string
): string {
  if (!allowed.size) {
    throw createError({
      statusCode: 503,
      statusMessage: `${label} configuration is unavailable.`,
    })
  }
  const id = text(value, label, 120, true)
  if (!allowed.has(id)) badRequest(`${label} is not enabled for this App.`)
  return id
}

function enumValue<T extends string>(
  value: unknown,
  values: ReadonlySet<T>,
  label: string
): T {
  const normalized = text(value, label, 80, true) as T
  if (!values.has(normalized)) badRequest(`${label} is invalid.`)
  return normalized
}

function normalizeCreateField(
  key: JobCreateField,
  value: unknown,
  scope: JobServerScope
): JobCreateIntent[JobCreateField] {
  switch (key) {
    case 'company_id':
      return documentId(value, 'Company id')
    case 'place_id':
      return documentId(value, 'Place id')
    case 'category_id':
      return configuredIdentifier(value, scope.categories, 'Job category')
    case 'contract_type':
      return enumValue(value, contractTypes, 'Contract type')
    case 'management_mode':
      return enumValue(value, managementModes, 'Management mode')
    case 'openings_count':
      return integer(value, 'Openings count', 1, 500)
    case 'compensation':
      return compensation(value, badRequest)
    case 'start_at':
      return timestamp(value, 'Start time')
    case 'end_at':
      return timestamp(value, 'End time')
    case 'title':
      return text(value, 'Job title', 240, true)
    case 'description':
      return text(value, 'Job description', 8_000, true)
  }
}

function rejectUnsupportedKeys(
  source: Record<string, unknown>,
  allowed: ReadonlySet<string>
): void {
  const unsupported = Object.keys(source).find(key => !allowed.has(key))
  if (unsupported) badRequest(`Unsupported Job field: ${unsupported}.`)
}

export function normalizeJobCreateIntent(
  value: unknown,
  scope: JobServerScope
): JobCreateIntent {
  const source = record(value)
  rejectUnsupportedKeys(source, createFieldSet)
  const normalized = Object.fromEntries(
    JOB_CREATE_FIELDS.map(key => [key, normalizeCreateField(key, source[key], scope)])
  ) as JobCreateIntent
  assertSchedule(normalized.contract_type, normalized.start_at, normalized.end_at, badRequest)
  return normalized
}

export function normalizeJobPatchIntent(
  value: unknown,
  scope: JobServerScope
): JobPatchIntent {
  const source = record(value)
  rejectUnsupportedKeys(source, patchFieldSet)
  const keys = Object.keys(source) as JobMutableField[]
  if (!keys.length) badRequest('A Job patch is required.')

  return Object.fromEntries(
    keys.map(key => [
      key,
      key === 'status'
        ? enumValue(source[key], statuses, 'Job status')
        : normalizeCreateField(key, source[key], scope),
    ])
  ) as JobPatchIntent
}

export function jobCreateFields(value: Record<string, unknown>): JobCreateIntent {
  return Object.fromEntries(
    JOB_CREATE_FIELDS.map(key => [key, value[key]])
  ) as JobCreateIntent
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
  return {
    at: at as NonNullable<Job['updated']['at']>,
    by,
  }
}

/** Exact canonical parser for every trusted raw Job read. */
export function canonicalJobRoot(
  id: string,
  value: unknown
): Job {
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
  if (!managementModes.has(managementMode)) schemaError('management_mode is invalid.')
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
    category_id: canonicalText(source.category_id, 'category_id', 120),
    contract_type: contractType,
    management_mode: managementMode,
    openings_count: openingsCount,
    compensation: compensation(source.compensation, schemaError),
    start_at: startAt,
    end_at: endAt,
    title: canonicalText(source.title, 'title', 240),
    description: canonicalText(source.description, 'description', 8_000),
    status,
    created: canonicalStamp(source.created, 'created') as Job['created'],
    updated: canonicalStamp(source.updated, 'updated') as Job['updated'],
  }
}

export type JobReference = {
  path: string
  label: string
}

export function jobReferences(job: JobCreateIntent): JobReference[] {
  const references = [
    { path: `places/${job.place_id}`, label: 'Job Place' },
    { path: `companies/${job.company_id}`, label: 'Company' },
    { path: `places/${job.company_id}`, label: 'Company Place' },
  ]

  return Array.from(
    new Map(references.map(reference => [reference.path, reference])).values()
  )
}
