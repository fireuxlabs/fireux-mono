import type {
  WeekdayTimeWindow,
  WeekdayTimeWindowsConfig,
} from '../models/shared/weekday-time.model'
import { weekdayTimeCore } from './weekday-time-core'

const readWeekdayTimeConfigValue = (
  value: unknown
): WeekdayTimeWindowsConfig => {
  const source = weekdayTimeCore.record(value)

  return {
    source: weekdayTimeCore.timeSource(source.source),
    timezone: weekdayTimeCore.text(source.timezone),
    windows: weekdayTimeCore
      .list(source.windows)
      .map(weekdayTimeCore.readWindow)
      .filter((window): window is WeekdayTimeWindow => Boolean(window)),
  }
}

const buildWeekdayTimeWindowFromRange = (
  startDay: unknown,
  endDay: unknown,
  openValue: unknown,
  closeValue: unknown
): WeekdayTimeWindow | null => {
  const start = weekdayTimeCore.dayName(startDay)
  const end = weekdayTimeCore.dayName(endDay)
  const open = weekdayTimeCore.normalizeTime(openValue)
  const close = weekdayTimeCore.normalizeTime(closeValue)
  if (!start || !end || !open || !close) return null

  return {
    days: weekdayTimeCore.expandDayRange(start, end),
    open,
    close,
  }
}

const parseWeekdayTimeConfigText = (
  value: string,
  timezone = ''
): WeekdayTimeWindowsConfig => {
  const windows = value
    .split('\n')
    .map((line, index) => {
      const source = line.trim()
      if (!source) return null

      const match = source.match(
        /^(.+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/
      )
      if (!match) {
        throw new Error(
          `Line ${index + 1} should look like "Tuesday 08:00 - 13:00".`
        )
      }

      const days = weekdayTimeCore.parseDays(match[1])
      const open = weekdayTimeCore.normalizeTime(match[2])
      const close = weekdayTimeCore.normalizeTime(match[3])
      if (!days.length || !open || !close) {
        throw new Error(`Line ${index + 1} has an invalid day or time.`)
      }

      return { days, open, close }
    })
    .filter((window): window is WeekdayTimeWindow => Boolean(window))

  return { source: 'custom', timezone, windows }
}

export const weekdayTimeConfig = {
  parseText: parseWeekdayTimeConfigText,
  readWindowsConfig: readWeekdayTimeConfigValue,
  windowFromRange: buildWeekdayTimeWindowFromRange,
}
