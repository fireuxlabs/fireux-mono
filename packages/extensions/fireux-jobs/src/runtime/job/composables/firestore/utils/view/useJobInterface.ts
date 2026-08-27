// Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: map canonical employer, Place, contract, schedule, and compensation truth.
import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import { financialCurrencyMinorUnitDigits } from 'fireux-finance/runtime/utils/money'
import type {
  JobCompanySummary,
  JobPlaceSummary,
} from '../../../../models/job-collection.model.ts'
import {
  JobStorage,
  type Job,
  type JobCompensation,
  type JobContractType,
  type JobManagementMode,
} from '../../../../models/job.model.ts'

export type JobView = Pick<
  Job,
  | 'id'
  | 'category_id'
  | 'visibility'
  | 'status'
  | 'contract_type'
  | 'management_mode'
  | 'openings_count'
  | 'compensation'
  | 'title'
  | 'description'
> & {
  company_id?: string
  place_id?: string
  company?: JobCompanySummary
  place?: JobPlaceSummary
  start_at: Job['start_at'] | string | null
  end_at: Job['end_at'] | string | null
}

export namespace JobCard {
  export type Card = {
    id: string
    to: string
    imageUrl: string
    title: string
    subtitle: string
    summary: string
    status: Job['status']
    description: string
    badges: string[]
    companyId: string
    companyName: string
    companyImageUrl: string
    placeId: string
    placeName: string
    placeAddress: string
    placeImageUrl: string
    contractTypeLabel: string
    managementModeLabel: string
    openingsLabel: string
    compensationLabel: string
    scheduleLabel: string
  }
}

const titleCase = (value: unknown) =>
  safeString(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

export function formatJobContractType(value: JobContractType): string {
  return titleCase(value)
}

export function formatJobManagementMode(value: JobManagementMode): string {
  return value === 'managed' ? 'Managed placement' : 'Direct hire'
}

export function formatJobOpenings(value: unknown): string {
  const count = Number(value)
  return Number.isInteger(count) && count > 0
    ? `${count} opening${count === 1 ? '' : 's'}`
    : 'Openings not specified'
}

export function formatJobCompensation(
  compensation: JobCompensation | null | undefined
): string {
  if (!compensation) return 'Pay not disclosed'
  const currencyCode = safeString(compensation.currency_code).toUpperCase()
  let digits = 2
  try {
    digits = financialCurrencyMinorUnitDigits(currencyCode)
  } catch {
    return 'Pay not disclosed'
  }
  const amount = Number(compensation.amount_minor) / 10 ** digits
  if (!Number.isFinite(amount)) return 'Pay not disclosed'

  let value = `${currencyCode} ${amount}`
  try {
    value = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch {
    // The server validates canonical currency codes; retain a readable fallback.
  }
  return `${value} / ${compensation.unit}`
}

function jobDate(value: JobView['start_at']): Date | null {
  if (!value) return null
  if (typeof value === 'string') {
    const date = new Date(value)
    return Number.isFinite(date.getTime()) ? date : null
  }
  const source = value as unknown as {
    seconds?: number
    toDate?: () => Date
  }
  const date =
    typeof source.toDate === 'function'
      ? source.toDate()
      : new Date(Number(source.seconds ?? Number.NaN) * 1_000)
  return Number.isFinite(date.getTime()) ? date : null
}

export function formatJobSchedule(
  startAt: JobView['start_at'],
  endAt: JobView['end_at']
): string {
  const start = jobDate(startAt)
  const end = jobDate(endAt)
  if (!start && !end) return 'Schedule not specified'
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  if (start && end)
    return `${formatter.format(start)} – ${formatter.format(end)}`
  if (start) return `Starts ${formatter.format(start)}`
  return `Ends ${formatter.format(end as Date)}`
}

export function useJobInterface() {
  type JobPill = JobCard.Card
  type JobCell = JobCard.Card
  type JobPreview = JobCard.Card
  type JobProfile = JobCard.Card

  function map(job: JobView): JobCard.Card {
    const id = safeString(job.id).trim()
    const companyName = safeString(job.company?.short_name || job.company?.name)
    const placeName = safeString(job.place?.short_name || job.place?.name)
    const placeAddress = safeString(job.place?.short_address)
    const contractTypeLabel = formatJobContractType(job.contract_type)
    const managementModeLabel = formatJobManagementMode(job.management_mode)
    const openingsLabel = formatJobOpenings(job.openings_count)
    const compensationLabel = formatJobCompensation(job.compensation)
    const scheduleLabel = formatJobSchedule(job.start_at, job.end_at)

    return {
      id,
      to: id ? `/${JobStorage.collection}/${encodeURIComponent(id)}` : '',
      imageUrl: safeString(job.place?.image_url || job.company?.image_url),
      title: safeString(job.title),
      subtitle: [companyName, placeAddress || placeName]
        .filter(Boolean)
        .join(' · '),
      summary: safeString(job.description),
      status: job.status,
      description: safeString(job.description),
      badges: [
        contractTypeLabel,
        ...(job.management_mode === 'managed' ? [managementModeLabel] : []),
        openingsLabel,
        compensationLabel,
      ],
      companyId: safeString(job.company_id),
      companyName,
      companyImageUrl: safeString(job.company?.image_url),
      placeId: safeString(job.place_id),
      placeName,
      placeAddress,
      placeImageUrl: safeString(job.place?.image_url),
      contractTypeLabel,
      managementModeLabel,
      openingsLabel,
      compensationLabel,
      scheduleLabel,
    }
  }

  function buildInterface(
    target?: JobView | null | undefined
  ): JobCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  const toInterface = buildInterface

  function pill(target?: JobView | null | undefined): JobPill | null {
    return buildInterface(target)
  }

  function cell(target?: JobView | null | undefined): JobCell | null {
    return buildInterface(target)
  }

  function preview(target?: JobView | null | undefined): JobPreview | null {
    return buildInterface(target)
  }

  function profile(target?: JobView | null | undefined): JobProfile | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
