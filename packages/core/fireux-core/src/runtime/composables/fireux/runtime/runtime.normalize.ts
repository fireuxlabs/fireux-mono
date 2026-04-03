import type { RuntimeMode } from './runtime.types'

const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeRuntimeMode = (
  value: unknown,
  options?: {
    defaultMode?: RuntimeMode
    aliases?: Record<string, RuntimeMode>
    allowed?: RuntimeMode[]
  }
): RuntimeMode => {
  const normalized = normalizeString(value).toLowerCase()

  const allowed: RuntimeMode[] = options?.allowed?.length
    ? options.allowed
    : ['read-only', 'live', 'test']

  const aliases: Record<string, RuntimeMode> = options?.aliases ?? {
    demo: 'read-only',
    dummy: 'read-only',
    readonly: 'read-only',
    real: 'live',
  }

  if (normalized in aliases) return aliases[normalized]

  if (allowed.includes(normalized as RuntimeMode)) return normalized as RuntimeMode

  return options?.defaultMode ?? 'read-only'
}
