// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: normalize bounded product-neutral Job authoring intents.
import { Timestamp } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type {
  JobCreateIntent,
  JobMutableField,
  JobPatchIntent,
} from '../../models/job-author.model.ts'
import type {
  Job,
  JobPayUnit,
  JobStatus,
  JobType,
} from '../../models/job.model.ts'
import type { JobServerScope } from './runtime.ts'

const JOB_TYPES = new Set<JobType>([
  'einsatz',
  'managed',
  'fixed',
  'permanent',
])
const PAY_UNITS = new Set<JobPayUnit>(['hour', 'shift', 'day'])
const STATUSES = new Set<JobStatus>(['open', 'closed'])

export const JOB_MUTABLE_FIELDS = [
  'company_id',
  'category_id',
  'workplace_type',
  'workplace_id',
  'workplace_label',
  'job_type',
  'openings_count',
  'pay_currency',
  'pay_rate',
  'pay_unit',
  'start_at',
  'end_at',
  'title',
  'description',
  'status',
] as const satisfies readonly JobMutableField[]

const mutableFieldSet = new Set<string>(JOB_MUTABLE_FIELDS)

function badRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badRequest('Job input must be an object.')
  }
  return value as Record<string, unknown>
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

function documentId(value: unknown, label: string): string {
  const id = text(value, label, 1_500, true)
  if (!isFirestoreDocumentId(id)) badRequest(`${label} is invalid.`)
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

function number(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number
): number {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    badRequest(`${label} must be from ${minimum} to ${maximum}.`)
  }
  return value
}

function timestamp(value: unknown, label: string): Job['start_at'] {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
  if (source && Object.keys(source).length === 0) return {} as Job['start_at']
  if (value instanceof Timestamp) return value as unknown as Job['start_at']

  const seconds = source?.seconds ?? source?._seconds
  const nanoseconds = source?.nanoseconds ?? source?._nanoseconds ?? 0
  if (
    typeof seconds === 'number' &&
    Number.isInteger(seconds) &&
    typeof nanoseconds === 'number' &&
    Number.isInteger(nanoseconds) &&
    nanoseconds >= 0 &&
    nanoseconds < 1_000_000_000
  ) {
    return new Timestamp(seconds, nanoseconds) as unknown as Job['start_at']
  }

  badRequest(`${label} must be empty or a valid timestamp.`)
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

function normalizeField(
  key: JobMutableField,
  value: unknown,
  scope: JobServerScope
): JobCreateIntent[JobMutableField] {
  switch (key) {
    case 'company_id':
      return documentId(value, 'Company id')
    case 'category_id':
      return configuredIdentifier(value, scope.categories, 'Job category')
    case 'workplace_type':
      return configuredIdentifier(value, scope.workplaces, 'Workplace type')
    case 'workplace_id':
      return documentId(value, 'Workplace id')
    case 'workplace_label':
      return text(value, 'Workplace label', 500)
    case 'job_type':
      return enumValue(value, JOB_TYPES, 'Job type')
    case 'openings_count':
      return integer(value, 'Openings count', 1, 500)
    case 'pay_currency': {
      const currency = text(value, 'Pay currency', 3, true).toUpperCase()
      if (!/^[A-Z]{3}$/.test(currency)) {
        badRequest('Pay currency must be a three-letter ISO code.')
      }
      return currency
    }
    case 'pay_rate':
      return number(value, 'Pay rate', 0, 1_000_000)
    case 'pay_unit':
      return enumValue(value, PAY_UNITS, 'Pay unit')
    case 'start_at':
      return timestamp(value, 'Start time')
    case 'end_at':
      return timestamp(value, 'End time')
    case 'title':
      return text(value, 'Job title', 240, true)
    case 'description':
      return text(value, 'Job description', 8_000, true)
    case 'status':
      return enumValue(value, STATUSES, 'Job status')
  }
}

function rejectUnsupportedKeys(source: Record<string, unknown>): void {
  const unsupported = Object.keys(source).find(key => !mutableFieldSet.has(key))
  if (unsupported) badRequest(`Unsupported Job field: ${unsupported}.`)
}

export function normalizeJobCreateIntent(
  value: unknown,
  scope: JobServerScope
): JobCreateIntent {
  const source = record(value)
  rejectUnsupportedKeys(source)

  return Object.fromEntries(
    JOB_MUTABLE_FIELDS.map(key => [key, normalizeField(key, source[key], scope)])
  ) as JobCreateIntent
}

export function normalizeJobPatchIntent(
  value: unknown,
  scope: JobServerScope
): JobPatchIntent {
  const source = record(value)
  rejectUnsupportedKeys(source)
  const keys = Object.keys(source) as JobMutableField[]
  if (!keys.length) badRequest('A Job patch is required.')

  return Object.fromEntries(
    keys.map(key => [key, normalizeField(key, source[key], scope)])
  ) as JobPatchIntent
}

export function mutableJobFields(value: Record<string, unknown>): JobCreateIntent {
  return Object.fromEntries(
    JOB_MUTABLE_FIELDS.map(key => [key, value[key]])
  ) as JobCreateIntent
}

export type JobReference = {
  path: string
  label: string
}

export function jobReferences(job: JobCreateIntent): JobReference[] {
  const references = [
    { path: `places/${job.workplace_id}`, label: 'Workplace Place' },
    { path: `companies/${job.company_id}`, label: 'Company' },
    { path: `places/${job.company_id}`, label: 'Company Place' },
  ]

  return Array.from(
    new Map(references.map(reference => [reference.path, reference])).values()
  )
}
