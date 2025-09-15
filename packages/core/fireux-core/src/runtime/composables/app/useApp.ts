// ~/composables/app/useApp.ts
import { computed, shallowRef } from 'vue'
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

  // Collections as Ref (sync wrapper returns Ref via VueFire stream)
  const apps = firestoreFetchCollection<App>('apps')

  // Users subcollection for any app
  const getAppUsers = (appId: string) => {
    const usersRef = collection(db, 'apps', appId, 'users')
    return useCollection(usersRef)
  }

  // Client-only extras: expose a loader to avoid awaiting inside composable
  const extras = shallowRef<any>(null)
  async function loadClientExtras() {
    if (!import.meta.client) return null
    if (extras.value) return extras.value
    const mod = await import('./useAppOnboarding')
    extras.value = mod.useAppOnboarding()
    return extras.value
  }

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
    // Onboarding helpers (client-only loader)
    loadClientExtras,
  }
}
