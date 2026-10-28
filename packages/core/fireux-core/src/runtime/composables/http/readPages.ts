import type { TypedFetchOptions } from 'nuxt/app'
/** Read the requested cursor chain through the supplied HTTP fetcher. */
export async function readPages<T extends { nextCursor?: string | null }>(
  fetcher: typeof $fetch,
  endpoint: string,
  pageCount: number,
  options: TypedFetchOptions<string, 'get'> = {},
  fields: string[] = ['items']
): Promise<T> {
  const records = new Map(
    fields.map((field) => [field, new Map<string, unknown>()])
  )
  let cursor: string | null | undefined
  let result: T
  for (let page = 0; page < pageCount; page++) {
    result = (await fetcher<T, string, 'get'>(endpoint, {
      ...options,
      method: 'get',
      query: { ...options.query, ...(cursor ? { cursor } : {}) },
    })) as T
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
