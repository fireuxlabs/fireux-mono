// Concurrent edit — 2026-07-19 16:58 CEST — Delivery pass: generalize the shared ordering-time seam beyond Collection.
// Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: expose no slots when Place/Kitchen timezone truth is absent.
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model.ts'
import {
  readWeekdayTimeNoticeState,
  readWeekdayTimeOpenState,
  readWeekdayTimeSelectionState,
  readWeekdayTimeWindowsConfig,
  weekdayTimeDays,
} from '../../utils/weekday-time'

export type MenuOrderTimeSelection = {
  mode: 'queue' | 'scheduled'
  requestedFor?: string
  label: string
}

export type MenuOrderTimeSlot = {
  label: string
  requestedFor: string
}

export type MenuOrderTimeDay = {
  date: string
  label: string
  slots: MenuOrderTimeSlot[]
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

  return `${value('year')}-${value('month')}-${value('day')}`
}

const addDays = (dateText: string, offset: number) => {
  const [year = NaN, month = NaN, day = NaN] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + offset))

  return date.toISOString().slice(0, 10)
}

const dayLabel = (dateText: string, offset: number) => {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'

  const [year = NaN, month = NaN, day = NaN] = dateText.split('-').map(Number)

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

const timeText = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const timeMinutes = (value: string) => {
  const [hour = NaN, minute = NaN] = value.split(':').map(Number)

  return hour * 60 + minute
}

const dateDay = (dateText: string) => {
  const date = new Date(`${dateText}T00:00:00Z`)
  const mondayIndex = (date.getUTCDay() + 6) % 7

  return weekdayTimeDays[mondayIndex]
}

const configuredSlotMinutes = (
  hours: WeekdayTimeWindowsConfig,
  dateText: string,
  interval: number
) => {
  const day = dateDay(dateText)
  if (!day) return []
  const previousDay =
    weekdayTimeDays[
      (weekdayTimeDays.indexOf(day) + weekdayTimeDays.length - 1) %
        weekdayTimeDays.length
    ]!
  const slots = new Set<number>()

  hours.windows.forEach((window) => {
    const open = timeMinutes(window.open)
    const close = timeMinutes(window.close)
    if (open < close && window.days.includes(day)) {
      for (let minute = open; minute < close; minute += interval)
        slots.add(minute)
      return
    }
    if (open >= close && window.days.includes(day)) {
      for (let minute = open; minute < 24 * 60; minute += interval)
        slots.add(minute)
    }
    if (open >= close && window.days.includes(previousDay)) {
      const first = (interval - ((24 * 60 - open) % interval)) % interval
      for (let minute = first; minute < close; minute += interval)
        slots.add(minute)
    }
  })

  return [...slots].sort((left, right) => left - right)
}

export function menuOrderTimeOptions(input: {
  hours: WeekdayTimeWindowsConfig | undefined
  noticeHours?: number
  asapEnabled?: boolean
  slotIntervalMinutes?: number
  scheduleHorizonDays?: number
  now?: Date
}) {
  const now = input.now || new Date()
  const hours = readWeekdayTimeWindowsConfig(input.hours)
  const known = Boolean(hours.timezone && hours.windows.length)
  const queueAvailable =
    input.asapEnabled !== false &&
    known &&
    readWeekdayTimeOpenState(hours, now).open
  if (!known) {
    return {
      known,
      queueAvailable,
      days: [] as MenuOrderTimeDay[],
    }
  }

  const today = zonedDateText(now, hours.timezone)
  const days: MenuOrderTimeDay[] = []
  const slotIntervalMinutes = [15, 30, 45, 60].includes(
    Number(input.slotIntervalMinutes)
  )
    ? Number(input.slotIntervalMinutes)
    : 30
  const scheduleHorizonDays = Math.min(
    30,
    Math.max(1, Math.round(Number(input.scheduleHorizonDays) || 7))
  )

  for (let offset = 0; offset < scheduleHorizonDays; offset += 1) {
    const date = addDays(today, offset)
    const slots: MenuOrderTimeSlot[] = []

    for (const minutes of configuredSlotMinutes(
      hours,
      date,
      slotIntervalMinutes
    )) {
      const time = timeText(minutes)
      const selection = readWeekdayTimeSelectionState(hours, date, time)
      if (!selection.available || !selection.requested_for) continue

      const notice = readWeekdayTimeNoticeState(
        hours,
        selection.requested_for,
        input.noticeHours,
        now
      )
      if (!notice.available) continue

      slots.push({
        label: time,
        requestedFor: selection.requested_for,
      })
    }

    if (slots.length) {
      days.push({
        date,
        label: dayLabel(date, offset),
        slots,
      })
    }
  }

  return { known, queueAvailable, days }
}
