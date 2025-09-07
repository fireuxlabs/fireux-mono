// ~/composables/app/useApp.ts
import { computed, ref } from 'vue'
import { doc, collection } from 'firebase/firestore'
import { useFirestore, useDocument, useCollection } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppUpdate } from './useAppUpdate'
import { useAppComputed } from './useAppComputed'
import { useAppEnsure } from './useEnsureApp'
import { useAppSubscriptionSetup } from './useAppSubscriptionSetup'
import type { App } from '../../models/core/app.model'
import { getApps } from 'firebase/app'

export async function useApp() {
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
    ? await firestoreFetchCollection<App>('apps')
    : ref([])

  // Users subcollection for any app
  const getAppUsers = (appId: string) => {
    const usersRef = collection(db, 'apps', appId, 'users')
    return useCollection(usersRef)
  }

  // Client-only extras (defer import to avoid pulling app-only APIs server-side)
  const clientExtras = import.meta.client
    ? (await import('./useAppOnboarding')).useAppOnboarding()
    : {}

  return {
    // Current entity
    app,

    // Collections
    apps,

    // Users subcollection
    getAppUsers,

    // Child functions
    ...useAppUpdate(),
    ...useAppComputed(app),
    ...useAppSubscriptionSetup(),
    ...useAppEnsure(),
  // Onboarding helpers (client-only)
  ...clientExtras,
  }
}
