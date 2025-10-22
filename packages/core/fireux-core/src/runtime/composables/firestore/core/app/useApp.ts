// ~/composables/app/useApp.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { getApps } from 'firebase/app'

import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAppComputed } from './useAppComputed.ts'
import { useAppUpdate } from './useAppUpdate.ts'
import { useAppEnsure } from './useAppEnsure.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

export function useApp() {
  const { appId } = useFireUXConfig()

  if (!getApps().length) {
    throw new Error('Firebase not initialized before useApp().')
  }

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreManager()

  const appDocRef = computed<DocumentReference<App> | null>(() =>
    appId ? (doc(db, 'apps', appId) as DocumentReference<App>) : null
  )
  const { data: app } = useDocument<App>(appDocRef)
  const apps = firestoreFetchCollection<App>('apps')

  const ensure = useAppEnsure()

  return {
    app,
    apps,
    ...useAppComputed(app),
    ...useAppUpdate(app),
    ensure,
    // temporary alias to maintain compatibility while callers update
    factory: ensure,
  }
}
