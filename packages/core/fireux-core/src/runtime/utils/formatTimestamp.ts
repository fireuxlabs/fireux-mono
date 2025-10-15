import type { Timestamp } from 'firebase/firestore'

export type FirestoreTimestampLike =
  | Timestamp
  | { seconds: number; nanoseconds?: number }
  | { _seconds: number; _nanoseconds?: number }
  | Date
  | string
  | number
  | null
  | undefined

export interface FormatTimestampOptions {
  fallback?: string
  locale?: string
  format?: Intl.DateTimeFormatOptions
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
}

export function coerceFirestoreTimestamp(
  value: FirestoreTimestampLike
): Date | null {
  if (!value && value !== 0) return null

  if (value instanceof Date) return value

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === 'object') {
    const anyValue = value as any

    if (typeof anyValue.toDate === 'function') {
      try {
        const date = anyValue.toDate()
        return date instanceof Date && !Number.isNaN(date.getTime())
          ? date
          : null
      } catch (
        /* istanbul ignore next: defensive */
        _err
      ) {
        return null
      }
    }

    if (typeof anyValue.seconds === 'number') {
      const seconds = Number(anyValue.seconds)
      const nanos = Number(anyValue.nanoseconds ?? 0)
      return new Date(seconds * 1000 + nanos / 1_000_000)
    }

    if (typeof anyValue._seconds === 'number') {
      const seconds = Number(anyValue._seconds)
      const nanos = Number(anyValue._nanoseconds ?? 0)
      return new Date(seconds * 1000 + nanos / 1_000_000)
    }
  }

  return null
}

export function formatFirestoreTimestamp(
  value: FirestoreTimestampLike,
  options: FormatTimestampOptions = {}
): string | undefined {
  const date = coerceFirestoreTimestamp(value)
  if (!date) return options.fallback

  const formatter = new Intl.DateTimeFormat(
    options.locale ?? undefined,
    options.format ?? DEFAULT_FORMAT
  )
  return formatter.format(date)
}
