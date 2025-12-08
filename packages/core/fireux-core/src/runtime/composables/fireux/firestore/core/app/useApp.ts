import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useAppFetch } from './fetch/useAppFetch'
import { useAppComputed } from './utils/view/useAppComputed'
import { useAppInterface } from './utils/view/useAppInterface'
import { useAppEnsure } from './mutations/useAppEnsure'
import { useAppUpdate } from './mutations/useAppUpdate'

export type { App } from 'fireux-core/runtime/models/core/app.model.ts'

/**
 * useApp
 * - Fetches and manages the runtime app
 * - Defaults to FireUXConfig.appId
 * - For arbitrary appId, call useAppFetch(appId) directly
 */
export function useApp() {
  const { appId } = useFireUXConfig()
  const { app, pending } = useAppFetch(appId)

  return {
    app,
    pending,
    ...useAppComputed(app, pending),
    ...useAppInterface(app),
    ...useAppEnsure(),
    ...useAppUpdate(app),
  }
}
