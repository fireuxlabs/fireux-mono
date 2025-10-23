// FILE: ~/composables/app/useApp.ts
import { computed } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'

import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import { useAppComputed } from './useAppComputed.ts'
import { useAppUpdate } from './useAppUpdate.ts'
import { useAppEnsure } from './useAppEnsure.ts'

export function useApp() {
  const { appId } = useFireUXConfig() // throws if missing => guarantees ID

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreManager()

  // Guaranteed ID means the ref can always be created
  const appDocRef = computed<DocumentReference<App>>(
    () => doc(db, 'apps', appId) as DocumentReference<App>
  )

  const { data: app } = useDocument<App>(appDocRef)
  const apps = firestoreFetchCollection<App>('apps')

  const ensure = computed(() => (app.value ? null : useAppEnsure()))
  const updates = computed(() => (app.value ? useAppUpdate(app) : null))

  return {
    app,
    apps,
    ...useAppComputed(app),
    updates, // null until app exists
    ensure, // null once app exists
    factory: ensure, // temporary alias for legacy callers
  }
}
