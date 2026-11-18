import { isMenuDate } from './date.ts'

/** The linked Place owns the Kitchen's calendar timezone. No browser-local fallback. */
export function menuLocalDate(timezone: string, now = new Date()): string {
  if (!timezone)
    throw new Error('Set the Place timezone before publishing a daily Menu.')
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) =>
    parts.find((value) => value.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function publishedMenuDates(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter(isMenuDate))].sort()
    : []
}

export function dailyMenuToday(
  menu: Record<string, unknown>,
  timezone: string,
  now = new Date()
) {
  const date = menuLocalDate(timezone, now)
  // Find the next local date boundary, including 23/25-hour DST days.
  let low = now.getTime(),
    high = low + 27 * 60 * 60 * 1000
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2)
    if (menuLocalDate(timezone, new Date(middle)) === date) low = middle
    else high = middle
  }
  return {
    date,
    timezone,
    nextChangeAt: high,
    published: publishedMenuDates(menu.published_dates).includes(date),
  }
}

/** Prefer a release today, or the next release in the sorted calendar. */
export function nextSpecialRelease(days: readonly string[], today: string) {
  return days.find((day) => day >= today)
}

/** Specials show today's release first, otherwise the next explicitly published date. */
export function dailyMenuSelection(
  menu: Record<string, unknown>,
  timezone: string,
  now = new Date()
) {
  const today = dailyMenuToday(menu, timezone, now)
  if (menu.purpose !== 'specials' || today.published) return today
  const next = nextSpecialRelease(
    publishedMenuDates(menu.published_dates),
    today.date
  )
  return next ? { ...today, date: next, published: true } : today
}
