import type {
  WeekdayTimeDay,
  WeekdayTimeWindow,
} from '../models/shared/weekday-time.model'
import { weekdayTimeCore } from './weekday-time-core'
import { weekdayTimeConfig } from './weekday-time-config'
import { weekdayTimeFormat } from './weekday-time-format'

const isWindowOpen = (
  window: WeekdayTimeWindow,
  day: WeekdayTimeDay,
  minutes: number
) => {
  const open = weekdayTimeCore.timeMinutes(window.open)
  const close = weekdayTimeCore.timeMinutes(window.close)
  if (open < 0 || close < 0 || minutes < 0) return false

  if (open < close) {
    return window.days.includes(day) && minutes >= open && minutes < close
  }

  return (
    (window.days.includes(day) && minutes >= open) ||
    (window.days.includes(weekdayTimeCore.previousDay(day)) && minutes < close)
  )
}

const readWeekdayTimeOpenStateValue = (value: unknown, now = new Date()) => {
  const hours = weekdayTimeConfig.readWindowsConfig(value)
  if (!hours.timezone) {
    return {
      known: false,
      open: false,
      label: 'Service times unavailable',
    }
  }
  const { day, minutes } = weekdayTimeFormat.zonedDayTime(now, hours.timezone)
  const known = Boolean(day && hours.windows.length)
  const open =
    day && hours.windows.length
      ? hours.windows.some((window) => isWindowOpen(window, day, minutes))
      : false

  return {
    known,
    open,
    label: known
      ? open
        ? 'Serving'
        : 'Not serving'
      : 'Service times unavailable',
  }
}

const readWeekdayTimeSelectionStateValue = (
  value: unknown,
  dateValue: unknown,
  timeValue: unknown
) => {
  const hours = weekdayTimeConfig.readWindowsConfig(value)
  if (!hours.timezone) {
    return {
      known: false,
      complete: Boolean(
        weekdayTimeCore.text(dateValue) &&
          weekdayTimeCore.normalizeTime(timeValue)
      ),
      available: false,
      requested_for: '',
      label: 'Service times unavailable.',
    }
  }
  const day = weekdayTimeFormat.inputDateDay(dateValue, hours.timezone)
  const dateText = weekdayTimeFormat.inputDateText(dateValue, hours.timezone)
  const timeText = weekdayTimeCore.normalizeTime(timeValue)
  const minutes = weekdayTimeCore.timeMinutes(timeValue)
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
    requested_for:
      available && dateText && timeText ? `${dateText}T${timeText}:00` : '',
    label: !complete
      ? ''
      : !known
        ? 'Service times unavailable.'
        : available
          ? 'Collection time available.'
          : 'Choose a time during collection hours.',
  }
}

const readWeekdayTimeNoticeStateValue = (
  value: unknown,
  requestedForValue: unknown,
  noticeHoursValue: unknown,
  now = new Date()
) => {
  const hours = weekdayTimeConfig.readWindowsConfig(value)
  const requestedForInput = weekdayTimeCore.text(requestedForValue)
  const match = requestedForInput.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  )
  const year = Number(match?.[1])
  const month = Number(match?.[2])
  const day = Number(match?.[3])
  const hour = Number(match?.[4])
  const minute = Number(match?.[5])
  const second = Number(match?.[6] || 0)
  const date = match
    ? new Date(Date.UTC(year, month - 1, day, hour, minute, second))
    : null
  const complete = Boolean(
    match &&
      date &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day &&
      date.getUTCHours() === hour &&
      date.getUTCMinutes() === minute &&
      date.getUTCSeconds() === second
  )
  const requestedFor = complete
    ? `${match?.[1]}-${match?.[2]}-${match?.[3]}T${match?.[4]}:${match?.[5]}`
    : ''
  const noticeHours = Math.max(0, Number(noticeHoursValue) || 0)
  const minimum = hours.timezone
    ? weekdayTimeFormat.zonedDateTimeText(
        new Date(now.getTime() + noticeHours * 60 * 60 * 1000),
        hours.timezone
      )
    : ''

  return {
    complete,
    available: Boolean(complete && minimum && requestedFor >= minimum),
    minimum,
    noticeHours,
  }
}

export const weekdayTimeState = {
  notice: readWeekdayTimeNoticeStateValue,
  open: readWeekdayTimeOpenStateValue,
  selection: readWeekdayTimeSelectionStateValue,
}
