import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import type { App } from '../models/app.model.ts'

export type AppCreateInput = Omit<App, 'created' | 'updated'>

/** Create exactly one App root document. */
export function useAppCreate() {
  const { createDocument } = useFirestoreCreate()

  async function createApp(input: AppCreateInput) {
    const id = String(input.id || '').trim()
    if (!id) throw new Error('App id is required.')
    return await createDocument('apps', input, { id, creator: false })
  }

  return { createApp }
}
