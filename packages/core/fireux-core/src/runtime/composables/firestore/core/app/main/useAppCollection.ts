import { useFirestoreRead } from '../../../operations/useFirestoreRead.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

export function useAppCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const apps = firestoreFetchCollection<App>('apps')
  return { apps }
}
