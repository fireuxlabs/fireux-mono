import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
} from '@internationalized/date'
import type { PlaceUpsertInput } from 'fireux-places/runtime/place/models/place.model'
import type { ExperienceItem } from '../../../models/profiles/Professional/Professional.model'

export type ExperienceCalendarUpdateValue =
  | DateValue
  | DateValue[]
  | { start?: DateValue | null; end?: DateValue | null }
  | null
  | undefined

const dateFormatter = new DateFormatter('en-US', { dateStyle: 'medium' })
const monthFormatter = new DateFormatter('en-US', { month: 'short' })
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

export const experienceItemTitle = (item: ExperienceItem) =>
  item.role || 'Experience'

export function experienceItemDate(item: ExperienceItem): string {
  if (!item.from_year && !item.to_year && !item.ongoing) return ''
  const start = item.from_year || 'Start'
  const end = item.ongoing ? 'Present' : item.to_year || 'End'
  return `${start}–${end}`
}

export function formatExperienceCollectionLabel(value: string): string {
  return String(value ?? '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function showExperienceDraftCard(item: ExperienceItem): boolean {
  const draft = (item as ExperienceItem & {
    place_draft?: Partial<PlaceUpsertInput>
  }).place_draft
  return Boolean(
    draft &&
      (draft.name ||
        draft.formatted_address ||
        draft.short_address ||
        draft.image_url)
  )
}

function monthToNumber(value: string | undefined): number | null {
  if (!value) return null
  const raw = String(value).trim()
  if (raw.length !== 3) return null
  const index = MONTHS.indexOf(raw.toLowerCase())
  return index >= 0 ? index + 1 : null
}

function toCalendarDate(
  month?: string,
  year?: string
): CalendarDate | null {
  const monthNumber = monthToNumber(month)
  const yearNumber = Number(String(year ?? '').trim())
  if (!monthNumber || !Number.isFinite(yearNumber)) return null
  return new CalendarDate(yearNumber, monthNumber, 1)
}

export function formatExperienceDateLabel(
  value: DateValue | null | undefined
): string {
  return value
    ? dateFormatter.format(value.toDate(getLocalTimeZone()))
    : ''
}

function updateFromDate(item: ExperienceItem, value: DateValue): void {
  item.from_month = monthFormatter.format(value.toDate(getLocalTimeZone()))
  item.from_year = String(value.year)
}

function updateToDate(item: ExperienceItem, value: DateValue): void {
  item.to_month = monthFormatter.format(value.toDate(getLocalTimeZone()))
  item.to_year = String(value.year)
}

export function getExperienceStartDate(item: ExperienceItem) {
  return toCalendarDate(item.from_month, item.from_year)
}

export function getExperienceEndDate(item: ExperienceItem) {
  return toCalendarDate(item.to_month, item.to_year)
}

export function getExperienceRange(item: ExperienceItem) {
  return {
    start: getExperienceStartDate(item) ?? undefined,
    end: getExperienceEndDate(item) ?? undefined,
  }
}

function isRangeValue(
  value: ExperienceCalendarUpdateValue
): value is { start?: DateValue | null; end?: DateValue | null } {
  return Boolean(value && !Array.isArray(value) && 'start' in value)
}

function isSingleDateValue(
  value: ExperienceCalendarUpdateValue
): value is DateValue {
  return Boolean(value && !Array.isArray(value) && !isRangeValue(value))
}

export function updateExperienceStart(
  item: ExperienceItem,
  value: ExperienceCalendarUpdateValue
): void {
  if (isSingleDateValue(value)) updateFromDate(item, value)
}

export function updateExperienceRange(
  item: ExperienceItem,
  value: ExperienceCalendarUpdateValue
): void {
  if (!isRangeValue(value)) return
  if (value.start) updateFromDate(item, value.start)
  if (value.end) {
    updateToDate(item, value.end)
  } else {
    item.to_month = ''
    item.to_year = ''
  }
}

export function toggleExperienceOngoing(
  item: ExperienceItem,
  value: boolean | 'indeterminate'
): void {
  item.ongoing = value === true
  if (item.ongoing) {
    item.to_month = ''
    item.to_year = ''
  }
}

export function newExperienceItem(): ExperienceItem {
  return {
    place_id: '',
    place_collection: '',
    role: '',
    responsibilities: '',
    from_month: '',
    from_year: '',
    to_month: '',
    to_year: '',
    ongoing: false,
  }
}
