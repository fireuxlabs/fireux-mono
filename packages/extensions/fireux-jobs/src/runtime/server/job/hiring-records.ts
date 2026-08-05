import { createHash } from 'node:crypto'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { createError, setHeader, type H3Event } from 'h3'
import {
  DIRECT_EMPLOYMENT_TERMS_VERSION,
  JOB_APPLICATION_STATUSES,
  type JobApplication,
  type JobApplicationAction,
  type JobApplicationStatus,
} from '../../models/job-application.model.ts'
import {
  JOB_ENGAGEMENT_STATUSES,
  type JobEngagement,
  type JobEngagementAction,
  type JobEngagementStatus,
} from '../../models/job-engagement.model.ts'
import {
  JOB_CONTRACT_TYPES,
  JOB_MANAGEMENT_MODES,
  type Job,
  type JobContractType,
  type JobManagementMode,
} from '../../models/job.model.ts'
import { AppProfessionalStorage } from '../../models/profiles/Professional/Professional.model.ts'
import { AppAgentStorage } from '../../models/profiles/Agent/Agent.model.ts'
import { canonicalJobRoot } from './validation.ts'

export const APPLICATION_LIMIT = 100
export const PREMIUM_TEMPORARY_CAPACITY_LIMIT = 100
const APPLICATION_MESSAGE_LIMIT = 2_000
const applicationStatuses = new Set<string>(JOB_APPLICATION_STATUSES)
const engagementStatuses = new Set<string>(JOB_ENGAGEMENT_STATUSES)
const contractTypes = new Set<string>(JOB_CONTRACT_TYPES)
const managementModes = new Set<string>(JOB_MANAGEMENT_MODES)

export const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export const text = (value: unknown): string => String(value ?? '').trim()

export function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function exactKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
): void {
  const allowlist = new Set(allowed)
  const unsupported = Object.keys(value).find((key) => !allowlist.has(key))
  if (unsupported) {
    fail(400, `${label} contains unsupported field ${unsupported}.`)
  }
}

export function markPrivateRead(event: H3Event): void {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
}

export function membershipRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/users/${uid}`)
}

export function appRef(db: FirebaseFirestore.Firestore, appId: string) {
  return db.doc(`apps/${appId}`)
}

export function appProfessionalRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/${AppProfessionalStorage.collection}/${uid}`)
}

export function appAgentRef(
  db: FirebaseFirestore.Firestore,
  appId: string,
  uid: string
) {
  return db.doc(`apps/${appId}/${AppAgentStorage.collection}/${uid}`)
}

export function isCurrentMembership(snapshot: DocumentSnapshot): boolean {
  if (!snapshot.exists) return false
  return ['user', 'admin'].includes(text(snapshot.data()?.role))
}

export function hasProfile(
  snapshot: DocumentSnapshot
): boolean {
  return snapshot.exists
}

export function assertCurrentAppMembership(
  appSnapshot: DocumentSnapshot,
  membershipSnapshot: DocumentSnapshot
): void {
  if (!appSnapshot.exists) fail(503, 'The current App is unavailable.')
  if (!isCurrentMembership(membershipSnapshot)) {
    fail(403, 'Current App membership is required.')
  }
}

export function hasPremiumCapacity(snapshot: DocumentSnapshot): boolean {
  if (!isCurrentMembership(snapshot)) return false
  const data = snapshot.data()
  return data?.role === 'admin' || data?.is_premium === true
}

export function applicationDocumentId(
  jobId: string,
  candidateUid: string
): string {
  return createHash('sha256')
    .update(`${jobId}\u0000${candidateUid}`)
    .digest('hex')
}

export function capacityDocumentId(
  appId: string,
  employerUid: string
): string {
  return createHash('sha256')
    .update(`${appId}\u0000${employerUid}`)
    .digest('hex')
}

export function stampMillis(value: unknown): number {
  const at = record(value).at as
    | { toMillis?: () => number; seconds?: number }
    | undefined
  if (at && typeof at.toMillis === 'function') return at.toMillis()
  return typeof at?.seconds === 'number' ? at.seconds * 1_000 : 0
}

export function canonicalJob(snapshot: DocumentSnapshot): Job {
  if (!snapshot.exists) fail(404, 'Job not found.')
  try {
    return canonicalJobRoot(snapshot.id, snapshot.data())
  } catch {
    return fail(503, 'The stored Job is not canonical.')
  }
}

function requiredText(
  source: Record<string, unknown>,
  key: string,
  maximum = 1_500
): string {
  const value = text(source[key])
  if (!value || value.length > maximum) {
    fail(503, `Stored ${key} is invalid.`)
  }
  return value
}

function optionalTimestamp(value: unknown) {
  if (value == null) return null
  const candidate = value as { toMillis?: () => number }
  if (typeof candidate.toMillis !== 'function') {
    fail(503, 'The stored Engagement is not canonical.')
  }
  return value as JobEngagement['start_at']
}

export function canonicalApplication(
  snapshot: DocumentSnapshot
): JobApplication {
  if (!snapshot.exists) fail(404, 'Application not found.')
  const source = record(snapshot.data())
  const status = text(source.status)
  if (!applicationStatuses.has(status)) {
    fail(503, 'The stored Application is not canonical.')
  }
  const message =
    typeof source.message === 'string' ? source.message.trim() : ''
  if (message.length > APPLICATION_MESSAGE_LIMIT) {
    fail(503, 'The stored Application is not canonical.')
  }
  const termsVersion =
    source.direct_employment_terms_version === null
      ? null
      : text(source.direct_employment_terms_version)
  const termsAcceptedAt =
    source.direct_employment_terms_accepted_at === null
      ? null
      : source.direct_employment_terms_accepted_at
  if (
    (termsVersion !== null && !termsVersion) ||
    (termsAcceptedAt !== null &&
      typeof (termsAcceptedAt as { toMillis?: unknown }).toMillis !==
        'function') ||
    (termsVersion === null) !== (termsAcceptedAt === null)
  ) {
    fail(503, 'The stored Application is not canonical.')
  }
  return {
    id: snapshot.id,
    source_app_id: requiredText(source, 'source_app_id'),
    source_ecosystem_id: requiredText(source, 'source_ecosystem_id', 120),
    job_id: requiredText(source, 'job_id'),
    employer_user_id: requiredText(source, 'employer_user_id'),
    candidate_user_id: requiredText(source, 'candidate_user_id'),
    company_id: requiredText(source, 'company_id'),
    place_id: requiredText(source, 'place_id'),
    message,
    status: status as JobApplicationStatus,
    offer_job_updated_at: optionalTimestamp(source.offer_job_updated_at),
    direct_employment_terms_version: termsVersion,
    direct_employment_terms_accepted_at:
      termsAcceptedAt as JobApplication['direct_employment_terms_accepted_at'],
    created: source.created as JobApplication['created'],
    updated: source.updated as JobApplication['updated'],
  }
}

export function canonicalEngagement(
  snapshot: DocumentSnapshot
): JobEngagement {
  if (!snapshot.exists) fail(404, 'Engagement not found.')
  const source = record(snapshot.data())
  const status = text(source.status)
  const contractType = text(source.contract_type)
  const managementMode = text(source.management_mode)
  if (
    !engagementStatuses.has(status) ||
    !contractTypes.has(contractType) ||
    !managementModes.has(managementMode)
  ) {
    fail(503, 'The stored Engagement is not canonical.')
  }
  return {
    id: snapshot.id,
    source_app_id: requiredText(source, 'source_app_id'),
    source_ecosystem_id: requiredText(source, 'source_ecosystem_id', 120),
    application_id: requiredText(source, 'application_id'),
    job_id: requiredText(source, 'job_id'),
    employer_user_id: requiredText(source, 'employer_user_id'),
    worker_user_id: requiredText(source, 'worker_user_id'),
    company_id: requiredText(source, 'company_id'),
    place_id: requiredText(source, 'place_id'),
    contract_type: contractType as JobContractType,
    management_mode: managementMode as JobManagementMode,
    status: status as JobEngagementStatus,
    direct_employment_terms_version: requiredText(
      source,
      'direct_employment_terms_version',
      80
    ),
    start_at: optionalTimestamp(source.start_at),
    end_at: optionalTimestamp(source.end_at),
    started_at: optionalTimestamp(source.started_at),
    completed_at: optionalTimestamp(source.completed_at),
    cancelled_at: optionalTimestamp(source.cancelled_at),
    created: source.created as JobEngagement['created'],
    updated: source.updated as JobEngagement['updated'],
  }
}

export function normalizeMessage(input: unknown): string {
  const source = record(input)
  exactKeys(source, ['message'], 'Application')
  const message =
    typeof source.message === 'string' ? source.message.trim() : ''
  if (message.length > APPLICATION_MESSAGE_LIMIT) {
    fail(
      400,
      `Application message must be ${APPLICATION_MESSAGE_LIMIT} characters or less.`
    )
  }
  return message
}

export function applicationAction(input: unknown): {
  action: JobApplicationAction
  acceptsDirectEmploymentTerms: boolean
} {
  const source = record(input)
  exactKeys(
    source,
    ['action', 'accept_direct_employment_terms'],
    'Application action'
  )
  const action = text(source.action)
  if (!['offer', 'reject', 'withdraw', 'accept'].includes(action)) {
    fail(400, 'Application action is invalid.')
  }
  return {
    action: action as JobApplicationAction,
    acceptsDirectEmploymentTerms:
      source.accept_direct_employment_terms === true,
  }
}

export function engagementAction(input: unknown): JobEngagementAction {
  const source = record(input)
  exactKeys(source, ['action'], 'Engagement action')
  const action = text(source.action)
  if (!['start', 'complete', 'cancel'].includes(action)) {
    fail(400, 'Engagement action is invalid.')
  }
  return action as JobEngagementAction
}

export { DIRECT_EMPLOYMENT_TERMS_VERSION }
