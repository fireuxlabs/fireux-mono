export type LocalDateParts = {
    year: number
    month: number
    day: number
  }

export function createKitchenFinanceCalendarDateTools(props: {
  locale: string
  timezone: string
}) {
  function parseDateKey(value: string): LocalDateParts | null {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
      if (!match) return null
  
      const parts = {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      }
      const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
      if (
        date.getUTCFullYear() !== parts.year ||
        date.getUTCMonth() !== parts.month - 1 ||
        date.getUTCDate() !== parts.day
      ) {
        return null
      }
      return parts
    }
  
  function parseMonthKey(value: string) {
      const match = /^(\d{4})-(\d{2})$/.exec(value)
      if (!match) return null
  
      const year = Number(match[1])
      const month = Number(match[2])
      if (month < 1 || month > 12) return null
      return { year, month }
    }
  
  function dateKeyFromParts(parts: LocalDateParts) {
      return [
        String(parts.year).padStart(4, '0'),
        String(parts.month).padStart(2, '0'),
        String(parts.day).padStart(2, '0'),
      ].join('-')
    }
  
  function addDays(dateKey: string, amount: number) {
      const parts = parseDateKey(dateKey)
      if (!parts) return dateKey
      const date = new Date(
        Date.UTC(parts.year, parts.month - 1, parts.day + amount)
      )
      return dateKeyFromParts({
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      })
    }
  
  function shiftMonth(monthKey: string, amount: number) {
      const month = parseMonthKey(monthKey)
      if (!month) return ''
      const date = new Date(Date.UTC(month.year, month.month - 1 + amount, 1))
      return [
        String(date.getUTCFullYear()).padStart(4, '0'),
        String(date.getUTCMonth() + 1).padStart(2, '0'),
      ].join('-')
    }
  
  function formatMonthLabel(monthKey: string) {
      const month = parseMonthKey(monthKey)
      if (!month) return 'Daily sales'
      return new Intl.DateTimeFormat(props.locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(month.year, month.month - 1, 1)))
    }
  
  function formatDateLabel(
      dateKey: string,
      options: Pick<
        Intl.DateTimeFormatOptions,
        'day' | 'month' | 'weekday' | 'year'
      >
    ) {
      const parts = parseDateKey(dateKey)
      if (!parts) return dateKey
      return new Intl.DateTimeFormat(props.locale, {
        ...options,
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)))
    }

  return {
    parseDateKey,
    parseMonthKey,
    dateKeyFromParts,
    addDays,
    shiftMonth,
    formatMonthLabel,
    formatDateLabel,
  }
}

