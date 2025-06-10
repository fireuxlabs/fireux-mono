import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppEnsure } from './useEnsureApp'
import { useAppOnboarding } from './useAppOnboarding'
import type { App } from '../../models/app.model'
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

  const appDocRef = computed(() => {
    return doc(db, 'apps', appId)
  })

  const { data: app } = useDocument<App>(appDocRef)

  const isInitialized = computed(() => {
    if (!app.value) return false // Return false by default if app is undefined or null
    return !!app.value.admin_ids?.length // Check if admin_ids exists and has a length
  })

  return {
    app,
    isInitialized,
    ...(await useAppEnsure()),
    ...(await useAppOnboarding()),
  }
}
