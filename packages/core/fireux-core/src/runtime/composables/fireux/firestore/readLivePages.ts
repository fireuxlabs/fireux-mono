import type { LiveFetch } from './useLiveAsyncData'

/** Re-read every loaded page through the live fetcher, replacing membership as cursors move. */
export async function readLivePages<T extends { nextCursor?: string | null }>(
  fetcher: LiveFetch,
  endpoint: string,
  pageCount: number,
  options: Record<string, any> = {},
  fields: string[] = ['items']
): Promise<T> {
  const records = new Map(
    fields.map((field) => [field, new Map<string, unknown>()])
  )
  let cursor: string | null | undefined
  let result: T
  for (let page = 0; page < pageCount; page++) {
    result = await fetcher<T>(endpoint, {
      ...options,
      query: { ...options.query, ...(cursor ? { cursor } : {}) },
    })
    for (const field of fields) {
      for (const item of (result as any)[field] || [])
        records.get(field)!.set(String(item.id), item)
    }
    cursor = result.nextCursor
    if (!cursor) break
  }
  return {
    ...result!,
    ...Object.fromEntries(
      [...records].map(([field, items]) => [field, [...items.values()]])
    ),
  }
}
