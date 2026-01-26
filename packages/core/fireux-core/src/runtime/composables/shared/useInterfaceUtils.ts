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
