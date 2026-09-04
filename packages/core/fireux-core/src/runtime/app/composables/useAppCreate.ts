import { useFirestoreCreate } from '../../composables/fireux/firestore/operations/useFirestoreCreate'
import type { App } from '../models/app.model.ts'

export type AppCreateInput = Omit<App, 'created' | 'updated' | 'ecosystem_id'> & {
  ecosystem_id?: never
}

/** Create exactly one App root document. */
export function useAppCreate() {
  const { createDocument } = useFirestoreCreate()

  async function createApp(input: AppCreateInput) {
    const id = String(input.id || '').trim()
    if (!id) throw new Error('App id is required.')
    if (Object.hasOwn(input, 'ecosystem_id')) {
      throw new Error('App–Ecosystem relationships require trusted App initialization.')
    }
    return await createDocument('apps', input, { id, creator: false })
  }

  return { createApp }
}
