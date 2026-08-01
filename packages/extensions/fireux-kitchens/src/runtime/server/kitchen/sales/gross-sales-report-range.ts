import { Timestamp } from 'firebase-admin/firestore'
import {
  KitchenFinanceReportPeriodDays,
  type KitchenFinanceReportPeriod,
} from '../../../models/kitchen/finance-report.model.ts'
import {
  KITCHEN_GROSS_SALES_REPORT_MAX_DAYS,
  MAX_PERIOD_MS,
  RFC3339_PATTERN,
  inputError,
  invariantError,
  type ReportRange,
} from './gross-sales-report-common'

export function requireCanonicalTimezone(value: unknown): string {
  if (
    typeof value !== 'string'
    || !value
    || value !== value.trim()
    || value.length > 100
  ) {
    return invariantError(
      'Kitchen operation hours require a valid IANA timezone.'
    )
  }

  try {
    return new Intl.DateTimeFormat('en', {
      timeZone: value,
    }).resolvedOptions().timeZone
  } catch {
    return invariantError(
      'Kitchen operation hours require a valid IANA timezone.'
    )
  }
}

export function localDateFormatter(timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatLocalDate(
  date: Date,
  formatter: Intl.DateTimeFormat
): string {
  const parts = formatter.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(candidate => candidate.type === type)?.value ?? ''
  const year = part('year')
  const month = part('month')
  const day = part('day')
  const value = `${year}-${month}-${day}`
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return invariantError('A Kitchen Sale could not be assigned a local date.')
  }
  return value
}

export function requireReportPeriod(value: unknown): KitchenFinanceReportPeriod {
  if (
    typeof value !== 'string'
    || !Object.hasOwn(KitchenFinanceReportPeriodDays, value)
  ) {
    return inputError('Report period must be 7d, 30d or 90d.')
  }
  return value as KitchenFinanceReportPeriod
}

export function addLocalDateDays(value: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match || !Number.isSafeInteger(days)) {
    return invariantError('Kitchen Finance local-date arithmetic is invalid.')
  }
  const date = new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]) + days
  ))
  if (!Number.isFinite(date.getTime())) {
    return invariantError('Kitchen Finance local date is outside range.')
  }
  return date.toISOString().slice(0, 10)
}

export function startOfLocalDate(
  value: string,
  formatter: Intl.DateTimeFormat
): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return invariantError('Kitchen Finance local date is invalid.')
  }
  const anchor = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  )
  let before = anchor - 48 * 60 * 60 * 1_000
  let atOrAfter = anchor + 48 * 60 * 60 * 1_000
  if (
    formatLocalDate(new Date(before), formatter) >= value
    || formatLocalDate(new Date(atOrAfter), formatter) < value
  ) {
    return invariantError('Kitchen Finance local date could not be bounded.')
  }

  while (atOrAfter - before > 1) {
    const middle = before + Math.floor((atOrAfter - before) / 2)
    if (formatLocalDate(new Date(middle), formatter) < value) {
      before = middle
    } else {
      atOrAfter = middle
    }
  }
  const result = new Date(atOrAfter)
  if (formatLocalDate(result, formatter) !== value) {
    return invariantError(
      'Kitchen Finance local midnight does not exist in this timezone.'
    )
  }
  return result
}

export function requireKitchenGrossSalesReportPeriodRange(input: {
  period: unknown
  timezone: unknown
  now?: Date
}) {
  const period = requireReportPeriod(input.period)
  const timezone = requireCanonicalTimezone(input.timezone)
  const now = input.now ?? new Date()
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    return invariantError('Kitchen Finance current time is invalid.')
  }
  const formatter = localDateFormatter(timezone)
  const periodToDate = formatLocalDate(now, formatter)
  const periodFromDate = addLocalDateDays(
    periodToDate,
    -KitchenFinanceReportPeriodDays[period]
  )
  const fromDate = startOfLocalDate(periodFromDate, formatter)
  const toDate = startOfLocalDate(periodToDate, formatter)
  const range = requireKitchenGrossSalesReportRange({
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  })

  return {
    period,
    timezone,
    now,
    range,
  }
}

export function requireLocalDate(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return inputError(`${label} must be a YYYY-MM-DD date.`)
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return inputError(`${label} must be a valid calendar date.`)
  }
  return value
}

export function requireKitchenGrossSalesReportLocalDateRange(input: {
  fromDate: unknown
  toDate: unknown
  timezone: unknown
  now?: Date
}) {
  const timezone = requireCanonicalTimezone(input.timezone)
  const now = input.now ?? new Date()
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    return invariantError('Kitchen Finance current time is invalid.')
  }
  const formatter = localDateFormatter(timezone)
  const fromLocalDate = requireLocalDate(input.fromDate, 'Report start')
  const toLocalDate = requireLocalDate(input.toDate, 'Report end')
  const today = formatLocalDate(now, formatter)
  if (fromLocalDate > toLocalDate) {
    return inputError('Report end must be on or after report start.')
  }
  if (toLocalDate > today) {
    return inputError('Report end must not be after today.')
  }
  const exclusiveToLocalDate = addLocalDateDays(toLocalDate, 1)
  const range = requireKitchenGrossSalesReportRange({
    from: startOfLocalDate(fromLocalDate, formatter).toISOString(),
    to: startOfLocalDate(exclusiveToLocalDate, formatter).toISOString(),
  })
  return { timezone, now, range }
}

export function requireKitchenGrossSalesReportPresetRange(input: {
  preset: unknown
  timezone: unknown
  now?: Date
}) {
  if (input.preset !== 'today' && input.preset !== 'last-week') {
    return inputError('Report preset must be today or last-week.')
  }
  const timezone = requireCanonicalTimezone(input.timezone)
  const now = input.now ?? new Date()
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    return invariantError('Kitchen Finance current time is invalid.')
  }
  const formatter = localDateFormatter(timezone)
  const today = formatLocalDate(now, formatter)
  if (input.preset === 'today') {
    return requireKitchenGrossSalesReportLocalDateRange({
      fromDate: today,
      toDate: today,
      timezone,
      now,
    })
  }
  const weekday = new Date(`${today}T00:00:00.000Z`).getUTCDay()
  const daysSinceMonday = (weekday + 6) % 7
  const thisMonday = addLocalDateDays(today, -daysSinceMonday)
  return requireKitchenGrossSalesReportLocalDateRange({
    fromDate: addLocalDateDays(thisMonday, -7),
    toDate: addLocalDateDays(thisMonday, -1),
    timezone,
    now,
  })
}

export function parseRfc3339(value: unknown, label: string): Date {
  if (typeof value !== 'string') {
    return inputError(`${label} must be a timezone-qualified RFC3339 value.`)
  }
  const match = RFC3339_PATTERN.exec(value)
  if (!match) {
    return inputError(`${label} must be a timezone-qualified RFC3339 value.`)
  }

  const [, year, month, day, hour, minute, second, fraction = ''] = match
  const millisecond = Number(fraction.padEnd(3, '0'))
  const calendar = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    millisecond
  ))
  if (
    calendar.getUTCFullYear() !== Number(year) ||
    calendar.getUTCMonth() !== Number(month) - 1 ||
    calendar.getUTCDate() !== Number(day) ||
    calendar.getUTCHours() !== Number(hour) ||
    calendar.getUTCMinutes() !== Number(minute) ||
    calendar.getUTCSeconds() !== Number(second)
  ) {
    return inputError(`${label} is not a valid calendar date.`)
  }

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) {
    return inputError(`${label} is not a valid date.`)
  }
  return date
}

export function requireKitchenGrossSalesReportRange(input: {
  from: unknown
  to: unknown
}): ReportRange {
  const fromDate = parseRfc3339(input.from, 'Report start')
  const toDate = parseRfc3339(input.to, 'Report end')
  const duration = toDate.getTime() - fromDate.getTime()
  if (duration <= 0) {
    return inputError('Report end must be after report start.')
  }
  if (duration > MAX_PERIOD_MS) {
    return inputError(
      `Report period must not exceed ${KITCHEN_GROSS_SALES_REPORT_MAX_DAYS} days.`
    )
  }

  try {
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      fromDate,
      toDate,
      fromTimestamp: Timestamp.fromDate(fromDate),
      toTimestamp: Timestamp.fromDate(toDate),
    }
  } catch {
    return inputError('Report period is outside the supported timestamp range.')
  }
}
