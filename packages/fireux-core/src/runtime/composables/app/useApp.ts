// ~/composables/app/useApp.ts
import { computed, ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppUpdate } from './useAppUpdate'
import { useAppEnsure } from './useEnsureApp'
import { useAppOnboarding } from './useAppOnboarding'
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
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const appDocRef = computed<DocumentReference<App> | null>(() => {
    return appId ? (doc(db, 'apps', appId) as DocumentReference<App>) : null
  })

  const { data: app } = useDocument<App>(appDocRef)

  // Collections - only fetch on client side
  const apps = import.meta.client
    ? firestoreFetchCollection<App>('apps')
    : ref([])

  // Computed properties
  const isInitialized = computed(() => {
    if (!app.value) return false // Return false by default if app is undefined or null
    return !!app.value.admin_ids?.length // Check if admin_ids exists and has a length
  })

  const isAdmin = computed(() => {
    if (!currentUser.value || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(currentUser.value.uid)
  })

  const hasDescription = computed(() => !!app.value?.description)
  const hasSocialLinks = computed(
    () =>
      !!app.value?.social_links &&
      Object.keys(app.value.social_links).length > 0
  )

  // Methods
  async function fetchApp(appId: string) {
    return await firestoreFetchDoc('apps', appId)
  }

  function hasAdmins(): boolean {
    return !!app.value?.admin_ids?.length
  }

  function isUserAdmin(userId?: string): boolean {
    const targetUserId = userId || currentUser.value?.uid
    if (!targetUserId || !app.value?.admin_ids) return false
    return app.value.admin_ids.includes(targetUserId)
  }

  function hasConfiguration(): boolean {
    return isInitialized.value && (hasDescription.value || hasSocialLinks.value)
  }

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

    // Computed properties
    isInitialized,
    isAdmin,
    hasDescription,
    hasSocialLinks,

    // Methods
    fetchApp,
    hasAdmins,
    isUserAdmin,
    hasConfiguration,

    // Utilities (async)
    ensureApp,
    checkEnv,
    createAppHandler,

    // Update functions
    ...useAppUpdate(),
  }
}
