import type {
  PlaceBusinessHours,
  PlaceBusinessHoursDay,
} from '../models/place.model'

const days: PlaceBusinessHoursDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const point = (value: unknown) => {
  const source = record(value)
  return typeof source.day === 'number' &&
    Number.isInteger(source.day) &&
    source.day >= 0 &&
    source.day <= 6 &&
    typeof source.time === 'string' &&
    /^([01]\d|2[0-3])[0-5]\d$/.test(source.time)
    ? {
        day: source.day,
        time: `${source.time.slice(0, 2)}:${source.time.slice(2)}`,
      }
    : null
}

/** Regular weekly periods only; do not turn exceptional or secondary hours into venue truth. */
export function readGoogleRegularHours(value: unknown): {
  hours: PlaceBusinessHours | null
  status: 'available' | 'missing' | 'unsupported'
} {
  const periods = record(value).periods
  if (!Array.isArray(periods) || !periods.length)
    return { hours: null, status: 'missing' }
  if (periods.length > 100) return { hours: null, status: 'unsupported' }
  const windows: PlaceBusinessHours['windows'] = []
  for (const period of periods) {
    const source = record(period)
    const open = point(source.open),
      close = point(source.close)
    if (!open) return { hours: null, status: 'unsupported' }
    if (
      periods.length === 1 &&
      open.day === 0 &&
      open.time === '00:00' &&
      source.close === undefined
    ) {
      return {
        hours: {
          windows: [{ days: [...days], open: '00:00', close: '00:00' }],
        },
        status: 'available',
      }
    }
    if (!close) return { hours: null, status: 'unsupported' }
    const span = (close.day - open.day + 7) % 7
    const ordinary = span === 0 && close.time > open.time
    const overnight = span === 1 && close.time < open.time
    const allDay = span === 1 && open.time === '00:00' && close.time === '00:00'
    if (!ordinary && !overnight && !allDay)
      return { hours: null, status: 'unsupported' }
    windows.push({
      days: [days[open.day]!],
      open: open.time,
      close: close.time,
    })
  }
  return { hours: { windows }, status: 'available' }
}
