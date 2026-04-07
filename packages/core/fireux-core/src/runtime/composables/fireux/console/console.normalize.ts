// console.normalize.ts
import type { ConsoleMode } from './console.types'

const toSingleValue = (value: unknown): unknown =>
  Array.isArray(value) ? value[0] : value

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeConsoleMode = (
  value: unknown,
  options?: {
    defaultMode?: ConsoleMode
    aliases?: Record<string, ConsoleMode>
    allowed?: ConsoleMode[]
  }
): ConsoleMode => {
  const normalized = normalizeString(value).toLowerCase()
  const allowed = options?.allowed?.length ? options.allowed : ['live', 'demo', 'test']
  const aliases = options?.aliases ?? {}

  if (normalized in aliases) return aliases[normalized]
  if (allowed.includes(normalized as ConsoleMode)) return normalized as ConsoleMode

  return options?.defaultMode ?? 'live'
}