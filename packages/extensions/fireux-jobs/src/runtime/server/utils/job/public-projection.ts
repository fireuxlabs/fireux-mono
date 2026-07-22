// Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: enforce source App scope without transporting it.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: exact-validate Jobs and join bounded Company/Place display truth.
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { projectPublicCompany } from 'fireux-companies/runtime/server/company/public-projection.ts'
import { projectPublicPlace } from 'fireux-places/runtime/server/place/public-projection.ts'
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
  categories: ReadonlySet<string>
  tenantAppId: string | null
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

  return {
    categories: validRole ? identifiers(jobs.categories) : new Set<string>(),
    tenantAppId:
      role === 'tenant'
        ? (isFirestoreDocumentId(appId) ? appId : '')
        : null,
  }
}

/** Cheap scope gate used before bounded linked-root hydration. */
export function isPublicJobCandidate(
  id: string,
  data: Record<string, unknown>,
  scope: PublicJobRuntimeScope
): boolean {
  if (!scope.categories.size || !isFirestoreDocumentId(id)) return false
  if (data.status !== 'open' || data.visibility !== 'public') return false

  const sourceAppId = text(data.source_app_id, 1_500)
  const categoryId = text(data.category_id, 120)
  return Boolean(
    isFirestoreDocumentId(sourceAppId) &&
    scope.categories.has(categoryId) &&
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
  }
}
