import { useFirestoreRead } from './useFirestoreRead'

export interface FirestorePrefixSearchOptions<T> {
  collection: string
  field: keyof T & string
  query: string
  limit?: number
  ssrKey?: string
}

export function useFirestoreSearch() {
  const { firestorePrefixSearch } = useFirestoreRead()

  async function prefixSearch<T>(
    options: FirestorePrefixSearchOptions<T>
  ): Promise<T[]> {
    const { collection, field, query, limit = 10 } = options
    return firestorePrefixSearch<T>(collection, field, query, limit)
  }

  return { prefixSearch }
}
