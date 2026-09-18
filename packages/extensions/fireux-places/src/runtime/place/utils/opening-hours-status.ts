import type { PlaceBusinessHours } from '../models/place.model'

const days = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]
const minuteOfDay = (time: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return -1
  return Number(match[1]) * 60 + Number(match[2])
}

/** Weekly wall-clock hours in the venue's timezone, including overnight ranges. */
export function readOpeningHoursStatus(
  hours: PlaceBusinessHours | undefined,
  timezone: string | undefined,
  now = new Date()
) {
  const unknown = {
    known: false,
    open: false,
    closes: '',
    next: '',
    nextInMinutes: null as number | null,
  }
  if (!timezone || !hours?.windows.length || !Number.isFinite(now.getTime()))
    return unknown
  let parts: Intl.DateTimeFormatPart[]
  try {
    parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
  } catch {
    return unknown
  }
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value || ''
  const today = days.indexOf(part('weekday').toLowerCase())
  const minutes = Number(part('hour')) * 60 + Number(part('minute'))
  if (today < 0 || !Number.isFinite(minutes)) return unknown
  const intervals: Array<{ start: number; end: number }> = []
  for (let offset = -1; offset <= 8; offset++) {
    const day = days[(today + offset + 7) % 7]
    for (const window of hours.windows) {
      if (!window.days.includes(day as (typeof window.days)[number])) continue
      const open = minuteOfDay(window.open),
        close = minuteOfDay(window.close)
      if (open < 0 || close < 0) continue
      intervals.push({
        start: offset * 1440 + open,
        end: offset * 1440 + close + (close <= open ? 1440 : 0),
      })
    }
  }
  if (!intervals.length) return unknown
  // Overlapping/adjacent windows are one continuous opening, including 24-hour days.
  const merged: typeof intervals = []
  for (const interval of intervals.sort((a, b) => a.start - b.start)) {
    const previous = merged[merged.length - 1]
    if (previous && interval.start <= previous.end)
      previous.end = Math.max(previous.end, interval.end)
    else merged.push({ ...interval })
  }
  const label = (absoluteMinutes: number) => {
    const offset = Math.floor(absoluteMinutes / 1440)
    const time = ((absoluteMinutes % 1440) + 1440) % 1440
    const clock = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`
    const day = days[(today + offset + 7) % 7]
    return `${offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : day.charAt(0).toUpperCase() + day.slice(1)} at ${clock}`
  }
  const current = merged.find(
    (interval) => interval.start <= minutes && interval.end > minutes
  )
  const next = merged.find((interval) => interval.start > minutes)
  return {
    known: true,
    open: Boolean(current),
    closes: current && current.end < 8 * 1440 ? label(current.end) : '',
    next: next ? label(next.start) : '',
    nextInMinutes: next ? next.start - minutes : null,
  }
}
