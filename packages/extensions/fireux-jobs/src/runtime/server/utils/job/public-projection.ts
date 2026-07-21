// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: enforce runtime category and tenant scope before mapping safe DTOs.
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import type {
  JobPayUnit,
  JobType,
} from '../../../models/job.model.ts'
import type { PublicJobProjection } from '../../../models/job-public.model.ts'

const JOB_TYPES = new Set<JobType>([
  'einsatz',
  'managed',
  'fixed',
  'permanent',
])
const JOB_PAY_UNITS = new Set<JobPayUnit>(['hour', 'shift', 'day'])

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

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function projectPublicJob(
  id: string,
  data: Record<string, unknown>,
  scope: PublicJobRuntimeScope
): PublicJobProjection | null {
  if (!scope.categories.size || !isFirestoreDocumentId(id)) return null
  if (data.status !== 'open' || data.visibility !== 'public') return null

  const sourceAppId = text(data.source_app_id, 1_500)
  const categoryId = text(data.category_id, 120)
  if (
    !isFirestoreDocumentId(sourceAppId) ||
    !scope.categories.has(categoryId) ||
    (scope.tenantAppId !== null && sourceAppId !== scope.tenantAppId)
  ) {
    return null
  }

  const title = text(data.title, 240)
  const description = text(data.description, 8_000)
  const workplaceType = text(data.workplace_type, 120)
  const workplaceLabel = text(data.workplace_label, 500)
  const jobType = text(data.job_type, 40) as JobType
  const payUnit = text(data.pay_unit, 40) as JobPayUnit
  const openingsCount = finiteNumber(data.openings_count)
  const payRate = finiteNumber(data.pay_rate)
  const payCurrency = text(data.pay_currency, 3).toUpperCase()

  if (
    !title ||
    !description ||
    !workplaceType ||
    !JOB_TYPES.has(jobType) ||
    !JOB_PAY_UNITS.has(payUnit) ||
    openingsCount == null ||
    !Number.isInteger(openingsCount) ||
    openingsCount < 1 ||
    openingsCount > 500 ||
    payRate == null ||
    payRate < 0 ||
    payRate > 1_000_000 ||
    !/^[A-Z]{3}$/.test(payCurrency)
  ) {
    return null
  }

  return {
    id,
    source_app_id: sourceAppId,
    category_id: categoryId,
    visibility: 'public',
    status: 'open',
    workplace_type: workplaceType,
    workplace_label: workplaceLabel,
    job_type: jobType,
    openings_count: openingsCount,
    pay_currency: payCurrency,
    pay_rate: payRate,
    pay_unit: payUnit,
    title,
    description,
  }
}
