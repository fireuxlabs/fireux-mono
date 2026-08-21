// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: omit next-opening copy when canonical timezone data is absent.
import { readWeekdayTimeWindowsConfig, weekdayTimeDays } from './weekday-time'
import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
} from '../models/shared/weekday-time.model'

const dayLabels: Record<WeekdayTimeDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}
const text = (value: unknown) => String(value ?? '').trim()
const timeMinutes = (value: unknown) => {
  const [hour, minute] = text(value).split(':').map(Number)

  return Number.isFinite(hour) && Number.isFinite(minute)
    ? hour * 60 + minute
    : -1
}
const zonedParts = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value || ''

  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    day: value('weekday').toLowerCase() as WeekdayTimeDay,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  }
}
const addDays = (dateText: string, offset: number) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + offset))

  return date.toISOString().slice(0, 10)
}
const dayForDate = (dateText: string): WeekdayTimeDay => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const dayIndex = date.getUTCDay()

  return weekdayTimeDays[(dayIndex + 6) % 7]
}
const candidateTime = (
  window: WeekdayTimeWindow,
  day: WeekdayTimeDay,
  currentMinutes: number,
  offset: number
) => {
  if (!window.days.includes(day)) return ''

  const openMinutes = timeMinutes(window.open)
  if (openMinutes < 0) return ''
  if (offset === 0 && openMinutes <= currentMinutes) return ''

  return window.open
}

export function readWeekdayTimeNextOpeningText(
  value: unknown,
  now = new Date()
) {
  const hours = readWeekdayTimeWindowsConfig(value)
  if (!hours.timezone || !hours.windows.length) return ''

  const current = zonedParts(now, hours.timezone)
  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDays(current.date, offset)
    const day = dayForDate(date)
    const times = hours.windows
      .map((window) => candidateTime(window, day, current.minutes, offset))
      .filter(Boolean)
      .sort()
    const time = times[0]
    if (!time) continue

    const label =
      offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : dayLabels[day]

    return `${label} at ${time}`
  }

  return ''
}
