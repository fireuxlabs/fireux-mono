import type { WeekdayTimeWindowsConfig } from '../models/shared/weekday-time.model'
import {
  readWeekdayTimeNoticeState,
  readWeekdayTimeOpenState,
  readWeekdayTimeSelectionState,
  readWeekdayTimeWindowsConfig,
} from './weekday-time'

export type MenuOrderCollectionTimeSelection = {
  mode: 'queue' | 'scheduled'
  requestedFor?: string
  label: string
}

export type MenuOrderCollectionTimeSlot = {
  label: string
  requestedFor: string
}

export type MenuOrderCollectionTimeDay = {
  date: string
  label: string
  slots: MenuOrderCollectionTimeSlot[]
}

const zonedDateText = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: string) =>
    parts.find(part => part.type === type)?.value || ''

  return `${value('year')}-${value('month')}-${value('day')}`
}

const addDays = (dateText: string, offset: number) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + offset))

  return date.toISOString().slice(0, 10)
}

const dayLabel = (dateText: string, offset: number) => {
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'

  const [year, month, day] = dateText.split('-').map(Number)

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

const timeText = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export function menuOrderCollectionTimeOptions(input: {
  hours: WeekdayTimeWindowsConfig | undefined
  noticeHours?: number
  asapEnabled?: boolean
  slotIntervalMinutes?: number
  scheduleHorizonDays?: number
  now?: Date
}) {
  const now = input.now || new Date()
  const hours = readWeekdayTimeWindowsConfig(input.hours)
  const known = hours.windows.length > 0
  const queueAvailable = input.asapEnabled !== false &&
    known &&
    readWeekdayTimeOpenState(hours, now).open
  if (!known) {
    return {
      known,
      queueAvailable,
      days: [] as MenuOrderCollectionTimeDay[],
    }
  }

  const today = zonedDateText(now, hours.timezone)
  const days: MenuOrderCollectionTimeDay[] = []
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
    const slots: MenuOrderCollectionTimeSlot[] = []

    for (
      let minutes = 0;
      minutes < 24 * 60;
      minutes += slotIntervalMinutes
    ) {
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
