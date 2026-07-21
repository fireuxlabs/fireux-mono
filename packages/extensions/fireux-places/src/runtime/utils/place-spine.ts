// Concurrent edit — 2026-07-20 20:51 CEST — Place-root authority pass: centralize sparse currency and business-hours normalization.
// Concurrent edit — 2026-07-21 16:25 CEST — Place onboarding enrichment: share currency suggestions and IANA timezone validation across client and server.
import type {
  PlaceBusinessHours,
  PlaceBusinessHoursDay,
  PlaceBusinessHoursWindow,
} from '../models/place.model'

const days = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly PlaceBusinessHoursDay[]

const googleDays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const satisfies readonly PlaceBusinessHoursDay[]

const currencyByCountry: Readonly<Record<string, string>> = {
  AT: 'EUR',
  AU: 'AUD',
  BE: 'EUR',
  CA: 'CAD',
  CH: 'CHF',
  DE: 'EUR',
  DK: 'DKK',
  ES: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  GB: 'GBP',
  IE: 'EUR',
  IT: 'EUR',
  LU: 'EUR',
  NL: 'EUR',
  NO: 'NOK',
  NZ: 'NZD',
  PT: 'EUR',
  SE: 'SEK',
  US: 'USD',
}

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const time = (value: unknown) => {
  const source = text(value)
  const compact = source.match(/^(\d{2})(\d{2})$/)
  const separated = source.match(/^(\d{1,2}):(\d{2})$/)
  const hour = Number(compact?.[1] ?? separated?.[1])
  const minute = Number(compact?.[2] ?? separated?.[2])

  return Number.isInteger(hour) && hour >= 0 && hour <= 23 &&
    Number.isInteger(minute) && minute >= 0 && minute <= 59
    ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    : ''
}

const day = (value: unknown): PlaceBusinessHoursDay | null => {
  const candidate = text(value).toLowerCase() as PlaceBusinessHoursDay
  return days.includes(candidate) ? candidate : null
}

const window = (value: unknown): PlaceBusinessHoursWindow | null => {
  const source = record(value)
  const windowDays = Array.isArray(source.days)
    ? Array.from(new Set(source.days.map(day).filter(Boolean))) as PlaceBusinessHoursDay[]
    : []
  const open = time(source.open)
  const close = time(source.close)

  return windowDays.length && open && close
    ? { days: windowDays, open, close }
    : null
}

export const normalizePlaceBusinessHours = (
  value: unknown
): PlaceBusinessHours | null => {
  const source = record(value)
  const windows = Array.isArray(source.windows)
    ? source.windows
      .map(window)
      .filter((item): item is PlaceBusinessHoursWindow => Boolean(item))
    : []

  return windows.length ? { windows } : null
}

export const normalizePlaceCurrencyCode = (value: unknown) => {
  const code = text(value).toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : ''
}

export const suggestPlaceCurrencyCode = (countryCode: unknown) =>
  currencyByCountry[text(countryCode).toUpperCase()] ?? ''

export const normalizePlaceTimezone = (value: unknown) => {
  const timezone = text(value)
  if (!timezone || timezone.length > 80) return ''
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format()
    return timezone
  } catch {
    return ''
  }
}

export const readPlaceCurrencyCode = (value: unknown) =>
  normalizePlaceCurrencyCode(record(value).default_currency_code)

export const readPlaceBusinessHours = (value: unknown) => {
  const source = record(value)
  const timezone = text(source.timezone)
  const businessHours = normalizePlaceBusinessHours(source.business_hours)

  return timezone && businessHours
    ? { timezone, windows: businessHours.windows }
    : null
}

export const placeBusinessHoursFromGooglePeriods = (
  value: unknown
): PlaceBusinessHours | null => {
  if (!Array.isArray(value)) return null

  const windows = value
    .map((period): PlaceBusinessHoursWindow | null => {
      const source = record(period)
      const open = record(source.open)
      const close = record(source.close)
      const openDay = googleDays[Number(open.day)]
      const openTime = time(open.time)

      if (!openDay || !openTime) return null
      if (!Object.keys(close).length && openDay === 'sunday' && openTime === '00:00') {
        return { days: [...days], open: '00:00', close: '00:00' }
      }

      const closeTime = time(close.time)
      return closeTime
        ? { days: [openDay], open: openTime, close: closeTime }
        : null
    })
    .filter((item): item is PlaceBusinessHoursWindow => Boolean(item))

  return windows.length ? { windows } : null
}
