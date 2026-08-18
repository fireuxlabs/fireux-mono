export const toShortAddress = (value?: string | null): string => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return ''

  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length <= 1) return raw

  const stripPostal = (part: string) =>
    part
      .replace(/^\d{4,5}-\d{2,5}\s*/g, '')
      .replace(/\b\d{3,5}\b\s*/g, '')
      .replace(/\b\d{4}\b\s*/g, '')
      .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, '')
      .replace(/\b\d{3,5}\s*[A-Za-z]{1,2}\b/g, '')
      .replace(/^[^\p{L}\p{N}]+/gu, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

  const normalize = (part: string) =>
    stripPostal(part.replace(/^\d+\s+/, '').trim())

  const selected = parts.length === 2 ? parts : parts.slice(-2)
  const cleaned = selected.map(normalize).filter(Boolean)

  if (!cleaned.length) return raw

  return cleaned
    .join(', ')
    .replace(/^[^\p{L}\p{N}]+/gu, '')
    .trim()
}
