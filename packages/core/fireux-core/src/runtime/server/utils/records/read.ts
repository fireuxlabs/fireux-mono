export function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function readRecordString(
  data: Record<string, unknown>,
  key: string
) {
  return readString(data[key])
}

export function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((entry) => readString(entry)).filter(Boolean)
    : []
}

export function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
