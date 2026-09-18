import { readWeekdayTimeWindowsConfig } from '../../utils/weekday-time'

/** Validate a deliberately configured schedule without borrowing another owner's hours. */
export function requireOperatingHours(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Hours require a timezone and valid ranges.')
  const input = value as Record<string, unknown>
  if (typeof input.timezone !== 'string' || !input.timezone.trim())
    throw new Error('Hours require a timezone.')
  try {
    new Intl.DateTimeFormat('en', { timeZone: input.timezone }).format()
  } catch {
    throw new Error('Hours require a valid timezone.')
  }
  if (
    !Array.isArray(input.windows) ||
    !input.windows.length ||
    input.windows.length > 100
  )
    throw new Error('Hours require valid time ranges.')
  const hours = readWeekdayTimeWindowsConfig({ ...input, source: 'custom' })
  if (hours.windows.length !== input.windows.length)
    throw new Error('Hours contain an invalid range.')
  return hours
}
