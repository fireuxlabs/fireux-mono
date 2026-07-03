import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
  WeekdayTimeWindowsConfig,
  WeekdayTimeWindowsSource,
} from '../models/shared/weekday-time.model'

export const weekdayTimeDays = [
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

export const weekdayTimeDayOptions = weekdayTimeDays.map((value) => ({
  value,
  label: dayLabels[value],
}))

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const uniqueDays = (days: WeekdayTimeDay[]) =>
  days.filter((day, index, source) => source.indexOf(day) === index)

const dayName = (value: unknown): WeekdayTimeDay | null => {
  const day = text(value).toLowerCase() as WeekdayTimeDay

  return weekdayTimeDays.includes(day) ? day : null
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
  weekdayTimeDays[
    (weekdayTimeDays.indexOf(day) + weekdayTimeDays.length - 1) %
      weekdayTimeDays.length
  ]

const timeSource = (value: unknown): WeekdayTimeWindowsSource => {
  const source = text(value).toLowerCase()

  return source === 'place' ? 'place' : 'custom'
}

const expandDayRange = (
  start: WeekdayTimeDay,
  end: WeekdayTimeDay
) => {
  const startIndex = weekdayTimeDays.indexOf(start)
  const endIndex = weekdayTimeDays.indexOf(end)
  if (startIndex < 0 || endIndex < 0) return []
  if (startIndex <= endIndex) {
    return weekdayTimeDays.slice(startIndex, endIndex + 1)
  }

  return [
    ...weekdayTimeDays.slice(startIndex),
    ...weekdayTimeDays.slice(0, endIndex + 1),
  ]
}

const parseDays = (value: string) => {
  const days = value
    .split(',')
    .flatMap((segment) => {
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

  return days.length && open && close ? { days: uniqueDays(days), open, close } : null
}

export const readWeekdayTimeWindowsConfig = (
  value: unknown
): WeekdayTimeWindowsConfig => {
  const source = record(value)

  return {
    source: timeSource(source.source),
    timezone: text(source.timezone) || 'Europe/Zurich',
    windows: list(source.windows)
      .map(readWindow)
      .filter((window): window is WeekdayTimeWindow => Boolean(window)),
  }
}

export const weekdayTimeWindowFromRange = (
  startDay: unknown,
  endDay: unknown,
  openValue: unknown,
  closeValue: unknown
): WeekdayTimeWindow | null => {
  const start = dayName(startDay)
  const end = dayName(endDay)
  const open = normalizeTime(openValue)
  const close = normalizeTime(closeValue)
  if (!start || !end || !open || !close) return null

  return {
    days: expandDayRange(start, end),
    open,
    close,
  }
}

export const formatWeekdayTimeWindow = (
  window: WeekdayTimeWindow
) => {
  const first = window.days[0]
  const last = window.days[window.days.length - 1]
  const dayLabel =
    first && last && window.days.length > 1
      ? `${dayLabels[first]} - ${dayLabels[last]}`
      : first
        ? dayLabels[first]
        : 'Days'

  return `${dayLabel} ${window.open} - ${window.close}`
}

export const weekdayTimeLines = (value: unknown) => {
  const hours = readWeekdayTimeWindowsConfig(value)

  return hours.windows.map(formatWeekdayTimeWindow)
}

export const formatWeekdayTimeText = (value: unknown) => {
  const hours = readWeekdayTimeWindowsConfig(value)

  return hours.windows.map(formatWeekdayTimeWindow).join('\n')
}

const zonedDayTime = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value || ''
  const day = dayName(value('weekday'))
  const hour = Number(value('hour'))
  const minute = Number(value('minute'))

  return {
    day,
    minutes: Number.isFinite(hour) && Number.isFinite(minute)
      ? hour * 60 + minute
      : -1,
  }
}

const inputDateDay = (
  value: unknown,
  timezone: string
): WeekdayTimeDay | null => {
  const source = text(value)
  if (source.toLowerCase() === 'today') {
    return zonedDayTime(new Date(), timezone).day
  }

  const match = source.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  const daysByUtcIndex = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ] as const

  return daysByUtcIndex[date.getUTCDay()]
}

const isWindowOpen = (
  window: WeekdayTimeWindow,
  day: WeekdayTimeDay,
  minutes: number
) => {
  const open = timeMinutes(window.open)
  const close = timeMinutes(window.close)
  if (open < 0 || close < 0 || minutes < 0) return false

  if (open < close) {
    return window.days.includes(day) && minutes >= open && minutes < close
  }

  return (
    (window.days.includes(day) && minutes >= open) ||
    (window.days.includes(previousDay(day)) && minutes < close)
  )
}

export const readWeekdayTimeOpenState = (
  value: unknown,
  now = new Date()
) => {
  const hours = readWeekdayTimeWindowsConfig(value)
  const { day, minutes } = zonedDayTime(now, hours.timezone)
  const known = Boolean(day && hours.windows.length)
  const open = day && hours.windows.length
    ? hours.windows.some((window) => isWindowOpen(window, day, minutes))
    : false

  return {
    known,
    open,
    label: known
      ? open ? 'Serving' : 'Not serving'
      : 'Service times unavailable',
  }
}

export const readWeekdayTimeSelectionState = (
  value: unknown,
  dateValue: unknown,
  timeValue: unknown
) => {
  const hours = readWeekdayTimeWindowsConfig(value)
  const day = inputDateDay(dateValue, hours.timezone)
  const minutes = timeMinutes(timeValue)
  const complete = Boolean(day && minutes >= 0)
  const known = Boolean(hours.windows.length)
  const available = Boolean(
    known &&
      day &&
      minutes >= 0 &&
      hours.windows.some((window) => isWindowOpen(window, day, minutes))
  )

  return {
    known,
    complete,
    available,
    label: !complete
      ? ''
      : !known
        ? 'Service times unavailable.'
        : available
          ? 'Collection time available.'
          : 'Choose a time during collection hours.',
  }
}

export const parseWeekdayTimeText = (
  value: string,
  timezone = 'Europe/Zurich'
): WeekdayTimeWindowsConfig => {
  const windows = value
    .split('\n')
    .map((line, index) => {
      const source = line.trim()
      if (!source) return null

      const match = source.match(/^(.+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/)
      if (!match) {
        throw new Error(`Line ${index + 1} should look like "Tuesday 08:00 - 13:00".`)
      }

      const days = parseDays(match[1])
      const open = normalizeTime(match[2])
      const close = normalizeTime(match[3])
      if (!days.length || !open || !close) {
        throw new Error(`Line ${index + 1} has an invalid day or time.`)
      }

      return { days, open, close }
    })
    .filter((window): window is WeekdayTimeWindow => Boolean(window))

  return { source: 'custom', timezone, windows }
}
