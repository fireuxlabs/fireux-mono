// Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: enforce source App scope without transporting it.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: exact-validate Jobs and join bounded Company/Place display truth.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: project every valid neutral category for explicit all-category Apps.
// Concurrent edit — 2026-07-22 13:06 CEST — Job category scope hardening: fail closed when runtime role or tenant identity is invalid.
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import {
  normalizeFireuxJobSourceAppDoorways,
  type FireuxJobSourceAppDoorways,
} from '../../../../config/jobs.config.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { projectPublicCompany } from 'fireux-companies/runtime/server/company/public-projection'
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection'
import type { PublicJobProjection } from '../../../models/job-public.model.ts'
import type { Job } from '../../../models/job.model.ts'
import { canonicalJobRoot } from '../../job/validation.ts'

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.trim().length <= maxLength
    ? value.trim()
    : ''

const identifiers = (value: unknown) =>
  new Set(
    Array.isArray(value)
      ? value
          .map(entry => text(entry, 120))
          .filter(Boolean)
      : []
  )

export type PublicJobRuntimeScope = {
  categoryScope: 'all' | 'allowlist'
  categories: ReadonlySet<string>
  tenantAppId: string | null
  sourceAppDoorways: FireuxJobSourceAppDoorways
}

export type PublicJobLinkedRoots = {
  company: Record<string, unknown>
  companyPlace: Record<string, unknown>
  place: Record<string, unknown>
}

export function readPublicJobRuntimeScope(
  event: H3Event
): PublicJobRuntimeScope {
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
    tenantAppId:
      eligible && role === 'tenant'
        ? appId
        : null,
    sourceAppDoorways: eligible
      ? normalizeFireuxJobSourceAppDoorways(jobs.sourceAppDoorways)
      : {},
  }
}

function projectApplicationDoorway(
  jobId: string,
  sourceAppId: string,
  scope: PublicJobRuntimeScope
) {
  if (scope.tenantAppId === sourceAppId) return null
  const doorway = scope.sourceAppDoorways[sourceAppId]
  if (!doorway) return null

  const path = `/jobs/${encodeURIComponent(jobId)}`
  return {
    label: doorway.label,
    url: `${doorway.url}${path}`,
  }
}

/** Cheap scope gate used before bounded linked-root hydration. */
export function isPublicJobCandidate(
  id: string,
  data: Record<string, unknown>,
  scope: PublicJobRuntimeScope
): boolean {
  if (
    (scope.categoryScope === 'allowlist' && !scope.categories.size) ||
    !isFirestoreDocumentId(id)
  ) return false
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
  return new Date(seconds * 1_000 + Math.floor(nanoseconds / 1_000_000)).toISOString()
}

export function projectPublicJob(
  id: string,
  data: Record<string, unknown>,
  scope: PublicJobRuntimeScope,
  linked: PublicJobLinkedRoots
): PublicJobProjection | null {
  if (!isPublicJobCandidate(id, data, scope)) return null

  const job = canonicalJobRoot(id, data)
  const applicationDoorway = projectApplicationDoorway(
    job.id,
    job.source_app_id,
    scope
  )
  const company = projectPublicCompany(
    job.company_id,
    linked.company,
    linked.companyPlace
  )
  const place = projectPublicPlace(job.place_id, linked.place)
  if (!company || !place) {
    throw new Error('Canonical Job has an invalid Company or Place relationship.')
  }

  return {
    id: job.id,
    category_id: job.category_id,
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
    ...(applicationDoorway
      ? { application_doorway: applicationDoorway }
      : {}),
  }
}
