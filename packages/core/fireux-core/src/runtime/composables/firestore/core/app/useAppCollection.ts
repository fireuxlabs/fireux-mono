import { useFirestoreRead } from '../../operations/useFirestoreRead.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

/**
 * Reactive handle to the full apps collection.
 */
export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const apps = firestoreFetchCollection<App>('apps')

  return { apps }
}
