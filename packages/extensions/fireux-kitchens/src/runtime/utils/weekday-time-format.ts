import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
} from '../models/shared/weekday-time.model'
import { weekdayTimeCore } from './weekday-time-core'
import { weekdayTimeConfig } from './weekday-time-config'

const formatWeekdayTimeWindowValue = (
  window: WeekdayTimeWindow
) => {
  const first = window.days[0]
  const last = window.days[window.days.length - 1]
  const dayLabel =
    first && last && window.days.length > 1
      ? `${weekdayTimeCore.dayLabels[first]} - ${weekdayTimeCore.dayLabels[last]}`
      : first
        ? weekdayTimeCore.dayLabels[first]
        : 'Days'

  return `${dayLabel} ${window.open} - ${window.close}`
}

const readWeekdayTimeLines = (value: unknown) => {
  const hours = weekdayTimeConfig.readWindowsConfig(value)

  return hours.windows.map(formatWeekdayTimeWindowValue)
}

const formatWeekdayTimeConfigText = (value: unknown) => {
  const hours = weekdayTimeConfig.readWindowsConfig(value)

  return hours.windows.map(formatWeekdayTimeWindowValue).join('\n')
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
  const day = weekdayTimeCore.dayName(value('weekday'))
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
  const source = weekdayTimeCore.text(value)
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

const zonedDateText = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value || ''
  const year = value('year')
  const month = value('month')
  const day = value('day')

  return year && month && day ? `${year}-${month}-${day}` : ''
}

const zonedDateTimeText = (date: Date, timezone: string) => {
  const dateText = zonedDateText(date, timezone)
  const { minutes } = zonedDayTime(date, timezone)
  if (!dateText || minutes < 0) return ''

  const hour = String(Math.floor(minutes / 60)).padStart(2, '0')
  const minute = String(minutes % 60).padStart(2, '0')

  return `${dateText}T${hour}:${minute}`
}

const inputDateText = (
  value: unknown,
  timezone: string
) => {
  const source = weekdayTimeCore.text(value)
  if (source.toLowerCase() === 'today') return zonedDateText(new Date(), timezone)

  return source.match(/^\d{4}-\d{2}-\d{2}$/) ? source : ''
}

export const weekdayTimeFormat = {
  formatText: formatWeekdayTimeConfigText,
  formatWindow: formatWeekdayTimeWindowValue,
  inputDateDay,
  inputDateText,
  lines: readWeekdayTimeLines,
  zonedDateText,
  zonedDateTimeText,
  zonedDayTime,
}
