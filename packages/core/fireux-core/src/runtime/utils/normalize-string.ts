export const normalizeString = (value: unknown): string =>
  String(value ?? '').trim()
