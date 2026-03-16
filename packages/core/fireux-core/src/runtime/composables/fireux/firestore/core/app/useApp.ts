import { useFireUXConfig } from '../../../app/FireUXConfig'
import { useAppFetch } from './fetch/useAppFetch'
import { useAppEnsure } from './mutations/useAppEnsure'
import { useAppUpdate } from './mutations/useAppUpdate'
import { useAppComputed } from './utils/view/useAppComputed'
import { useAppInterface } from './utils/view/useAppInterface'

export type { App } from '../../../../../models/core/app.model'

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
