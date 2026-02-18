export function safeString(input: unknown): string {
  return typeof input === 'string' ? input : ''
}

export function safeArray<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : []
}

export function safeStringArray(input: unknown): string[] {
  return safeArray<unknown>(input)
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function csv(list: unknown, separator = ', '): string {
  return safeStringArray(list).join(separator)
}

export function locationLabel(list: unknown): string {
  const parsed = safeArray<unknown>(list)
    .map((item: any) => {
      const city = safeString(item?.city)
      const country = safeString(item?.country)
      if (!city && !country) return ''
      return [city, country].filter(Boolean).join(', ')
    })
    .filter(Boolean)

  return parsed.join(' · ')
}

export function sanitizeShortAddress(value: string): string {
  return safeString(value).replace(/^[^\p{L}\p{N}]+/gu, '').trim()
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function stripLocationFromTitle(title: string, shortAddress: string): string {
  const cleanedTitle = safeString(title)
  const cleanedShort = sanitizeShortAddress(shortAddress)
  if (!cleanedTitle || !cleanedShort) return cleanedTitle

  const parts = cleanedShort
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (!parts.length) return cleanedTitle

  let next = cleanedTitle
  for (const part of parts) {
    if (part.length < 3) continue
    const pattern = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi')
    next = next.replace(pattern, '').trim()
  }

  next = next
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*[-–—|/]\s*(?=[-–—|/]|$)/g, ' ')
    .replace(/^[-–—|/\s]+/, '')
    .replace(/[-–—|/\s]+$/, '')
    .trim()

  return next || cleanedTitle
}
