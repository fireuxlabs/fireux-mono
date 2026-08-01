import { Timestamp } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { requireFinancialMoney } from 'fireux-finance/runtime/utils/money.ts'
import {
  JOB_PAY_UNITS,
  type Job,
  type JobCompensation,
  type JobContractType,
  type JobPayUnit,
} from '../../models/job.model.ts'

const payUnits = new Set<JobPayUnit>(JOB_PAY_UNITS)

export function badJobRequest(statusMessage: string): never {
  throw createError({ statusCode: 400, statusMessage })
}

export function jobSchemaError(message: string): never {
  throw new Error(`Canonical Job is invalid: ${message}`)
}

export function requireJobInputRecord(
  value: unknown,
  label = 'Job input'
): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    badJobRequest(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

export function requireJobSchemaRecord(
  value: unknown,
  label: string
): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    jobSchemaError(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[]
): boolean {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  )
}

export function requireJobSchemaKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
  label: string
): void {
  if (!hasExactKeys(value, keys)) {
    jobSchemaError(`${label} has unsupported or missing fields.`)
  }
}

export function readJobText(
  value: unknown,
  label: string,
  maxLength: number,
  required = false
): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (required && !normalized) badJobRequest(`${label} is required.`)
  if (normalized.length > maxLength) {
    badJobRequest(`${label} must be ${maxLength} characters or less.`)
  }
  return normalized
}

export function readCanonicalJobText(
  value: unknown,
  label: string,
  maxLength: number,
  required = true
): string {
  if (typeof value !== 'string') jobSchemaError(`${label} must be a string.`)
  const normalized = value.trim()
  if (required && !normalized) jobSchemaError(`${label} is required.`)
  if (normalized !== value || normalized.length > maxLength) {
    jobSchemaError(`${label} is not canonical.`)
  }
  return normalized
}

export function readJobDocumentId(value: unknown, label: string): string {
  const id = readJobText(value, label, 1_500, true)
  if (!isFirestoreDocumentId(id)) badJobRequest(`${label} is invalid.`)
  return id
}

export function readCanonicalJobDocumentId(
  value: unknown,
  label: string
): string {
  const id = readCanonicalJobText(value, label, 1_500)
  if (!isFirestoreDocumentId(id)) jobSchemaError(`${label} is invalid.`)
  return id
}

export function readJobInteger(
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
    badJobRequest(`${label} must be an integer from ${minimum} to ${maximum}.`)
  }
  return value
}

type TimestampParts = { seconds: number; nanoseconds: number }

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

export function readJobTimestamp(
  value: unknown,
  label: string
): Job['start_at'] {
  if (value === null) return null
  if (value instanceof Timestamp) return value as unknown as Job['start_at']
  const parts = timestampParts(value)
  if (!parts) badJobRequest(`${label} must be null or a valid timestamp.`)
  return new Timestamp(
    parts.seconds,
    parts.nanoseconds
  ) as unknown as Job['start_at']
}

export function readCanonicalJobTimestamp(
  value: unknown,
  label: string,
  nullable: boolean
): Job['start_at'] {
  if (value === null && nullable) return null
  if (value instanceof Timestamp) return value as Job['start_at']
  jobSchemaError(
    `${label} must be ${nullable ? 'null or ' : ''}a valid timestamp.`
  )
}

function compareTimestamps(
  left: NonNullable<Job['start_at']>,
  right: NonNullable<Job['start_at']>
): number {
  const leftParts = timestampParts(left)
  const rightParts = timestampParts(right)
  if (!leftParts || !rightParts) {
    jobSchemaError('schedule timestamps are invalid.')
  }
  return (
    leftParts.seconds - rightParts.seconds ||
    leftParts.nanoseconds - rightParts.nanoseconds
  )
}

export function assertJobSchedule(
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
  if (endAt && !startAt) fail('An end time requires a start time.')
  if (startAt && endAt && compareTimestamps(startAt, endAt) >= 0) {
    fail('End time must be after start time.')
  }
}

export function readJobCompensation(
  value: unknown,
  fail: (message: string) => never
): JobCompensation | null {
  if (value === null) return null
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('Compensation must be null or an object.')
  }
  const source = value as Record<string, unknown>
  if (!hasExactKeys(source, ['amount_minor', 'currency_code', 'unit'])) {
    fail(
      'Compensation must contain only amount_minor, currency_code, and unit.'
    )
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
