// ~/composables/app/useApp.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { getApps } from 'firebase/app'

import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppComputed } from './useAppComputed'
import { useAppUpdate } from './useAppUpdate'
import { useAppFactory } from './useAppFactory'
import type { AppDoc } from '../../models/core/app.model'

export function useApp() {
  const { appId } = useFireUXConfig()

  if (!getApps().length) {
    throw new Error('Firebase not initialized before useApp().')
  }

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreManager()

  const appDocRef = computed<DocumentReference<AppDoc> | null>(() =>
    appId ? (doc(db, 'apps', appId) as DocumentReference<AppDoc>) : null
  )
  const { data: app } = useDocument<AppDoc>(appDocRef)
  const apps = firestoreFetchCollection<AppDoc>('apps')

  return {
    app,
    apps,
    ...useAppComputed(app),
    ...useAppUpdate(app),
    factory: useAppFactory(app),
  }
}
