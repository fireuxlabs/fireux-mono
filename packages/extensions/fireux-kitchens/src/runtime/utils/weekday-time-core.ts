import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
  WeekdayTimeWindowsSource,
} from '../models/shared/weekday-time.model'

const weekdayTimeCoreDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly WeekdayTimeDay[]

const dayLabels: Record<WeekdayTimeDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

const weekdayTimeCoreDayOptions = weekdayTimeCoreDays.map((value) => ({
  value,
  label: dayLabels[value],
}))

const text = (value: unknown) => String(value ?? '').trim()

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const uniqueDays = (days: WeekdayTimeDay[]) =>
  days.filter((day, index, source) => source.indexOf(day) === index)

const dayName = (value: unknown): WeekdayTimeDay | null => {
  const day = text(value).toLowerCase() as WeekdayTimeDay

  return weekdayTimeCoreDays.includes(day) ? day : null
}

const normalizeTime = (value: unknown) => {
  const match = text(value).match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return ''

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return ''

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const timeMinutes = (value: unknown) => {
  const normalized = normalizeTime(value)
  if (!normalized) return -1

  const [hour, minute] = normalized.split(':').map(Number)
  return hour * 60 + minute
}

const previousDay = (day: WeekdayTimeDay) =>
  weekdayTimeCoreDays[
    (weekdayTimeCoreDays.indexOf(day) + weekdayTimeCoreDays.length - 1) %
      weekdayTimeCoreDays.length
  ]

const timeSource = (value: unknown): WeekdayTimeWindowsSource => {
  const source = text(value).toLowerCase()

  return source === 'place' ? 'place' : 'custom'
}

const expandDayRange = (start: WeekdayTimeDay, end: WeekdayTimeDay) => {
  const startIndex = weekdayTimeCoreDays.indexOf(start)
  const endIndex = weekdayTimeCoreDays.indexOf(end)
  if (startIndex < 0 || endIndex < 0) return []
  if (startIndex <= endIndex) {
    return weekdayTimeCoreDays.slice(startIndex, endIndex + 1)
  }

  return [
    ...weekdayTimeCoreDays.slice(startIndex),
    ...weekdayTimeCoreDays.slice(0, endIndex + 1),
  ]
}

const parseDays = (value: string) => {
  const days = value.split(',').flatMap((segment) => {
    const range = segment
      .trim()
      .toLowerCase()
      .split(/\s+(?:to|-)\s+|\s*-\s*/)
      .map(dayName)
      .filter((day): day is WeekdayTimeDay => Boolean(day))

    return range.length === 2 ? expandDayRange(range[0], range[1]) : range
  })

  return uniqueDays(days)
}

const readWindow = (value: unknown): WeekdayTimeWindow | null => {
  const row = record(value)
  const days = list(row.days)
    .map(dayName)
    .filter((day): day is WeekdayTimeDay => Boolean(day))
  const open = normalizeTime(row.open)
  const close = normalizeTime(row.close)

  return days.length && open && close
    ? { days: uniqueDays(days), open, close }
    : null
}

export const weekdayTimeCore = {
  dayLabels,
  dayName,
  dayOptions: weekdayTimeCoreDayOptions,
  days: weekdayTimeCoreDays,
  expandDayRange,
  list,
  normalizeTime,
  parseDays,
  previousDay,
  readWindow,
  record,
  text,
  timeMinutes,
  timeSource,
  uniqueDays,
}
