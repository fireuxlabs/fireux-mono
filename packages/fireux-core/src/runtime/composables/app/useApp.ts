// ~/composables/app/useApp.ts
import { computed, ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppUpdate } from './useAppUpdate'
import { useAppComputed } from './useAppComputed'
import { useAppOnboarding } from './useAppOnboarding'
import { useAppEnsure } from './useEnsureApp'
import { useAppSubscriptionSetup } from './useAppSubscriptionSetup'
import type { App } from '../../models/app.model'
import { getApps } from 'firebase/app'

export function useApp() {
  const { appId } = useFireUXConfig()

  // Ensure Firebase is initialized
  if (!getApps().length) {
    throw new Error(
      'Firebase is not initialized. Please initialize Firebase before using this composable.'
    )
  }

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreManager()

  const appDocRef = computed<DocumentReference<App> | null>(() => {
    return appId ? (doc(db, 'apps', appId) as DocumentReference<App>) : null
  })

  const { data: app } = useDocument<App>(appDocRef)

  // Collections - only fetch on client side
  const apps = import.meta.client
    ? firestoreFetchCollection<App>('apps')
    : ref([])

  return {
    // Current entity
    app,

    // Collections
    apps,

    // Child functions
    ...useAppUpdate(),
    ...useAppComputed(app),
    ...useAppSubscriptionSetup(),
    ...useAppEnsure(),
    ...useAppOnboarding(),
  }
}
