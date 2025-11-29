import { useFireUXConfig } from '../../../FireUXConfig'
import { useAppFetch } from './main/useAppFetch'
import { useAppComputed } from './state/useAppComputed'
import { useAppInterface } from './state/useAppInterface'
import { useAppEnsure } from './core/useAppEnsure'
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
