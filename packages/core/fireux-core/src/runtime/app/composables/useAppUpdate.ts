import { unref, type MaybeRef } from 'vue'
import { useFirestoreUpdate } from '../../composables/fireux/firestore/operations/useFirestoreUpdate'
import type { App } from '../models/app.model.ts'

export type AppUpdateInput = Partial<Omit<App, 'id' | 'created' | 'updated'>>

/** Update exactly one App root document. */
export function useAppUpdate(appId: MaybeRef<string>) {
  const { updateDocument } = useFirestoreUpdate()

  async function updateApp(changes: AppUpdateInput) {
    const id = String(unref(appId) || '').trim()
    if (!id) throw new Error('App id is required.')
    await updateDocument<App>('apps', id, changes, { updater: false })
  }

  return { updateApp }
}
