import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import {
  ProfessionalConstraints,
  type ExperienceItem,
} from '../../../../utils/profiles/Professional/professional'

type DateSortFields = {
  ongoingKey?: string
  fromYearKey?: string
  fromMonthKey?: string
  toYearKey?: string
  toMonthKey?: string
  startYearKey?: string
  endYearKey?: string
}

const DEFAULT_DATE_FIELDS: Required<DateSortFields> = {
  ongoingKey: 'ongoing',
  fromYearKey: 'from_year',
  fromMonthKey: 'from_month',
  toYearKey: 'to_year',
  toMonthKey: 'to_month',
  startYearKey: 'start_year',
  endYearKey: 'end_year',
}

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
]

export function cleanProfessionalText(
  value: unknown,
  maxSize: number,
  label = 'Value'
): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (normalized.length > maxSize) {
    throw new Error(`${label} must be ${maxSize} characters or less.`)
  }
  return normalized
}

export function assertProfessionalListLimit(
  items: unknown[],
  maxItems: number,
  label: string
): void {
  if (items.length > maxItems) {
    throw new Error(`${label} supports at most ${maxItems} items.`)
  }
}

function monthToNumber(value: unknown): number | null {
  if (value == null) return null
  const raw = String(value).trim()
  if (raw.length !== 3) return null
  const index = MONTHS.indexOf(raw.toLowerCase())
  return index >= 0 ? index + 1 : null
}

function toNumber(value: unknown): number | null {
  const raw =
    typeof value === 'number' ? value : Number(String(value ?? '').trim())
  return Number.isFinite(raw) ? raw : null
}

function resolveDateParts(
  item: Record<string, unknown>,
  fields: Required<DateSortFields>
) {
  const ongoing = Boolean(item[fields.ongoingKey])
  const fromYear = toNumber(
    item[fields.fromYearKey] ?? item[fields.startYearKey]
  )
  const fromMonth = monthToNumber(item[fields.fromMonthKey])
  const toYear = toNumber(item[fields.toYearKey] ?? item[fields.endYearKey])
  const toMonth = monthToNumber(item[fields.toMonthKey])
  return {
    ongoing,
    startValue: fromYear ? fromYear * 12 + (fromMonth ?? 1) : null,
    endValue: ongoing
      ? Number.POSITIVE_INFINITY
      : toYear
        ? toYear * 12 + (toMonth ?? 1)
        : null,
  }
}

export function sortProfessionalItemsByDate<T>(
  list: T[],
  fields?: DateSortFields
): T[] {
  const merged = { ...DEFAULT_DATE_FIELDS, ...(fields ?? {}) }
  return list
    .map((item, index) => ({
      item,
      index,
      ...resolveDateParts(item as Record<string, unknown>, merged),
    }))
    .sort((a, b) => {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1
      const endDifference = (b.endValue ?? -Infinity) - (a.endValue ?? -Infinity)
      if (endDifference) return endDifference
      const startDifference =
        (b.startValue ?? -Infinity) - (a.startValue ?? -Infinity)
      return startDifference || a.index - b.index
    })
    .map((row) => row.item)
}

export function cleanProfessionalYear(value: unknown): string | null {
  const normalized =
    typeof value === 'number' && Number.isInteger(value)
      ? String(value)
      : typeof value === 'string'
        ? value.trim()
        : ''
  if (!normalized) return null
  if (!/^\d{4}$/.test(normalized)) {
    throw new Error('Year must contain exactly four digits.')
  }
  const year = Number(normalized)
  if (
    year < ProfessionalConstraints.yearMin ||
    year > ProfessionalConstraints.yearMax
  ) {
    throw new Error('Year is outside the supported range.')
  }
  return normalized
}

function cleanExperienceMonth(value: unknown): string {
  const normalized = cleanProfessionalText(value, 16, 'Experience month')
  const canonical = normalized
    ? `${normalized.slice(0, 1).toUpperCase()}${normalized.slice(1).toLowerCase()}`
    : ''
  if (
    normalized !== canonical ||
    (canonical && !MONTHS.includes(canonical.toLowerCase()))
  ) {
    throw new Error('Experience month must use a three-letter month.')
  }
  return canonical
}

function normalizePlaceId(value?: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!isFirestoreDocumentId(raw)) {
    throw new Error('Experience must reference a valid Place.')
  }
  return raw
}

export function sanitizeProfessionalExperienceItems(
  items: ExperienceItem[]
): ExperienceItem[] {
  assertProfessionalListLimit(
    items ?? [],
    ProfessionalConstraints.relevantExperience,
    'Experience'
  )
  return (items ?? []).map((item) => ({
    place_id: normalizePlaceId(item?.place_id),
    place_collection: cleanProfessionalText(item?.place_collection, 120),
    role: cleanProfessionalText(item?.role, 160),
    from_month: cleanExperienceMonth(item?.from_month),
    from_year: cleanProfessionalYear(item?.from_year) ?? '',
    to_month: cleanExperienceMonth(item?.to_month),
    to_year: cleanProfessionalYear(item?.to_year) ?? '',
    ongoing: item?.ongoing === true,
    responsibilities: cleanProfessionalText(item?.responsibilities, 4_000),
  }))
}
