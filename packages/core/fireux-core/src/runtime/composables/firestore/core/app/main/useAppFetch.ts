// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppFetch.ts
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

/**
 * Fetch a single app document by id.
 * Reactive through VueFire — no computed layer required.
 */
export function useAppFetch(appId: string | null | undefined) {
  const db = useFirestore()
  const docRef = appId ? (doc(db, 'apps', appId) as any) : null
  const { data: app } = useDocument<App | undefined>(docRef)
  return { app }
}
