export const DAY_MS = 86_400_000
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function addIsoDays(date: string, days: number) {
  const timestamp = Date.parse(`${date}T00:00:00.000Z`)
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Kitchen Demo Finance date is invalid: ${date}.`)
  }
  return new Date(timestamp + days * DAY_MS).toISOString().slice(0, 10)
}

export function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format(new Date(0))
    return Boolean(value)
  } catch {
    return false
  }
}

