import { useFireUXConfig } from 'fireux-core/runtime/composables/core/config/FireUXConfig.ts'
import { useAppFetch } from './data/fetch'
import { useAppComputed } from './state/computed'
import { useAppInterface } from './state/interface'
import { useAppEnsure } from './data/ensure'
import { useAppUpdate } from './actions/update'

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
