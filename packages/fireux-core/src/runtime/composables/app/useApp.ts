// ~/composables/app/useApp.ts
import { computed, ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppUpdate } from './useAppUpdate'
import { useAppEnsure } from './useEnsureApp'
import { useAppOnboarding } from './useAppOnboarding'
import { useAppComputed } from './useAppComputed'
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

  // Utilities - direct imports for consistency
  async function ensureApp() {
    const { ensureApp } = await useAppEnsure()
    return ensureApp()
  }

  async function checkEnv() {
    const { checkEnv } = await useAppOnboarding()
    return checkEnv()
  }

  async function createAppHandler() {
    const { createAppHandler } = await useAppOnboarding()
    return createAppHandler()
  }

  return {
    // Current entity
    app,

    // Collections
    apps,

    // Utilities (async)
    ensureApp,
    checkEnv,
    createAppHandler,

    // Child functions
    ...useAppUpdate(),
    ...useAppComputed(app),
  }
}
