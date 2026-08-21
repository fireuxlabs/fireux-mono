// Concurrent edit — 2026-07-21 13:09 CEST — Job reads: enforce source App and category scope.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: exact-validate Jobs and join bounded Company/Place display truth.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: project every valid neutral category for explicit all-category Apps.
// Concurrent edit — 2026-07-22 13:06 CEST — Job category scope hardening: fail closed when runtime role or tenant identity is invalid.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  isFirestoreDocumentId,
  requireFirestoreDocumentId,
} from 'fireux-core/runtime/server/utils/ids/path'
import { CompanyStorage } from 'fireux-companies/runtime/place/models/company.model'
import { canonicalCompanyRole } from 'fireux-companies/runtime/place/server/company/canonical'
import { projectCompanyDirectoryEntry } from 'fireux-companies/runtime/place/server/company/projection'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  JobDetailResponse,
  JobDirectoryEntry,
} from '../../models/job-directory.model.ts'
import type { Job } from '../../models/job.model.ts'
import { canonicalJobRoot } from '../core/validation.ts'
import { projectSourceAppDoorway } from '../core/source-app-doorway.ts'

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim().length <= maxLength
    ? value.trim()
    : ''

const identifiers = (value: unknown) =>
  new Set(
    Array.isArray(value)
      ? value.map((entry) => text(entry, 120)).filter(Boolean)
      : []
  )

export type JobReadScope = {
  categoryScope: 'all' | 'allowlist'
  categories: ReadonlySet<string>
  tenantAppId: string | null
}

export type JobLinkedRoots = {
  company: Record<string, unknown>
  companyPlace: Record<string, unknown>
  place: Record<string, unknown>
  sourceApp: Record<string, unknown>
}

export function readJobReadScope(event: H3Event): JobReadScope {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const jobs = (fireux.jobs ?? {}) as Record<string, unknown>
  const role = text(fireux.role, 40)
  const appId = text(fireux.id, 1_500)
  const validRole =
    role === 'global' || role === 'tenant' || role === 'standalone'
  const eligible =
    validRole && (role !== 'tenant' || isFirestoreDocumentId(appId))

  return {
    categoryScope:
      eligible && jobs.categoryScope === 'all' ? 'all' : 'allowlist',
    categories: eligible ? identifiers(jobs.categories) : new Set<string>(),
    tenantAppId: eligible && role === 'tenant' ? appId : null,
  }
}

function projectApplicationDoorway(
  jobId: string,
  sourceAppId: string,
  scope: JobReadScope,
  sourceApp: Record<string, unknown>
) {
  if (scope.tenantAppId === sourceAppId) return null
  return projectSourceAppDoorway(jobId, sourceApp)
}

/** Cheap scope gate used before bounded linked-root hydration. */
export function isJobDirectoryCandidate(
  id: string,
  data: Record<string, unknown>,
  scope: JobReadScope
): boolean {
  if (
    (scope.categoryScope === 'allowlist' && !scope.categories.size) ||
    !isFirestoreDocumentId(id)
  )
    return false
  if (data.status !== 'open' || data.visibility !== 'public') return false

  const sourceAppId = text(data.source_app_id, 1_500)
  const categoryId = text(data.category_id, 120)
  return Boolean(
    isFirestoreDocumentId(sourceAppId) &&
      isFirestoreDocumentId(categoryId) &&
      (scope.categoryScope === 'all' || scope.categories.has(categoryId)) &&
      (scope.tenantAppId === null || sourceAppId === scope.tenantAppId)
  )
}

function timestampIso(value: Job['start_at']): string | null {
  if (!value) return null
  const stamp = value as unknown as {
    toDate?: () => Date
    seconds?: number
    nanoseconds?: number
    _seconds?: number
    _nanoseconds?: number
  }
  if (typeof stamp.toDate === 'function') {
    const date = stamp.toDate()
    if (Number.isFinite(date.getTime())) return date.toISOString()
  }
  const seconds = stamp.seconds ?? stamp._seconds
  const nanoseconds = stamp.nanoseconds ?? stamp._nanoseconds ?? 0
  if (
    typeof seconds !== 'number' ||
    !Number.isInteger(seconds) ||
    typeof nanoseconds !== 'number' ||
    !Number.isInteger(nanoseconds)
  ) {
    throw new Error('Canonical Job schedule contains an invalid timestamp.')
  }
  return new Date(
    seconds * 1_000 + Math.floor(nanoseconds / 1_000_000)
  ).toISOString()
}

export function projectJobDirectoryEntry(
  id: string,
  data: Record<string, unknown>,
  scope: JobReadScope,
  linked: JobLinkedRoots
): JobDirectoryEntry | null {
  if (!isJobDirectoryCandidate(id, data, scope)) return null

  const job = canonicalJobRoot(id, data)
  const applicationDoorway = projectApplicationDoorway(
    job.id,
    job.source_app_id,
    scope,
    linked.sourceApp
  )
  const company = projectCompanyDirectoryEntry(
    job.company_id,
    linked.company,
    linked.companyPlace
  )
  const place = normalizePlace(job.place_id, linked.place)
  if (!company || !place) {
    throw new Error(
      'Canonical Job has an invalid Company or Place relationship.'
    )
  }

  return {
    id: job.id,
    category_id: job.category_id,
    company_id: job.company_id,
    place_id: job.place_id,
    visibility: 'public',
    status: 'open',
    company: {
      name: company.name,
      ...(company.short_name ? { short_name: company.short_name } : {}),
      ...(company.image_url ? { image_url: company.image_url } : {}),
    },
    place: {
      name: place.name,
      ...(place.short_name ? { short_name: place.short_name } : {}),
      ...(place.short_address ? { short_address: place.short_address } : {}),
      ...(place.image_url ? { image_url: place.image_url } : {}),
    },
    contract_type: job.contract_type,
    management_mode: job.management_mode,
    openings_count: job.openings_count,
    compensation: job.compensation,
    start_at: timestampIso(job.start_at),
    end_at: timestampIso(job.end_at),
    title: job.title,
    description: job.description,
    ...(applicationDoorway ? { application_doorway: applicationDoorway } : {}),
  }
}

export async function readJobDetail(
  event: H3Event,
  idValue: unknown
): Promise<JobDetailResponse> {
  const id = requireFirestoreDocumentId(idValue, 'Job id')
  const scope = readJobReadScope(event)
  if (scope.categoryScope === 'allowlist' && !scope.categories.size) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  const db = getRuntimeFirestore()
  const snapshot = await db
    .collection('jobs')
    .doc(id)
    .get()
    .catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job could not be read.',
      })
    })
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  const data = snapshot.data() || {}
  if (!isJobDirectoryCandidate(snapshot.id, data, scope)) {
    throw createError({ statusCode: 404, statusMessage: 'Job not found' })
  }

  let job: Job
  try {
    job = canonicalJobRoot(snapshot.id, data)
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: 'The published Job is not canonical.',
    })
  }

  const [companySnapshot, companyPlaceSnapshot, placeSnapshot, sourceApp] =
    await db
      .getAll(
        db.collection(CompanyStorage.collection).doc(job.company_id),
        db.collection('places').doc(job.company_id),
        db.collection('places').doc(job.place_id),
        db.collection(AppStorage.collection).doc(job.source_app_id)
      )
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Job relationships could not be read.',
        })
      })

  if (
    !companySnapshot.exists ||
    !companyPlaceSnapshot.exists ||
    !placeSnapshot.exists ||
    !sourceApp.exists
  ) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The published Job has unavailable relationships.',
    })
  }

  const company = canonicalCompanyRole(
    companySnapshot.id,
    companySnapshot.data()
  )
  const companyPlace = normalizePlace(
    companyPlaceSnapshot.id,
    companyPlaceSnapshot.data() || {}
  )
  const place = normalizePlace(placeSnapshot.id, placeSnapshot.data() || {})
  if (!company || !companyPlace || !place) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The published Job has invalid relationships.',
    })
  }

  const applicationDoorway = projectApplicationDoorway(
    job.id,
    job.source_app_id,
    scope,
    sourceApp.data() || {}
  )

  return {
    job,
    company,
    companyPlace,
    place,
    ...(applicationDoorway ? { applicationDoorway } : {}),
  }
}
