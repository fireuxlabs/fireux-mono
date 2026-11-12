export function asTrimmedString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : ''
}
