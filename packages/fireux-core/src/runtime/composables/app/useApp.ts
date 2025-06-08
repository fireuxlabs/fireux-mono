import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useAppEnsure } from './useEnsureApp'
import { useAppOnboarding } from './useAppOnboarding'
import type { App } from '../../models/app.model'
import { getApps, getApp } from 'firebase/app'

export function useApp() {
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

  const isInitialised = computed(() => {
    if (app.value === undefined) return undefined
    if (app.value === null) return false
    return !!app.value.admin_ids?.length
  })

  // Integrate onboarding and ensure logicFirebase operations must be executed on the client side.Firebase operations must be executed on the client side.Firebase operations must be executed on the client side.
  const ensure = useAppEnsure()
  const onboarding = useAppOnboarding()

  const ensureApp = async () => {
    console.log('Placeholder for ensureApp function')
  }

  return {
    app,
    isInitialised,
    ensureApp,
    ...ensure,
    ...onboarding,
  }
}
