import { useFireUXConfig } from '../../../FireUXConfig'
import { useAppFetch } from './main/useAppFetch'
import { useAppComputed } from './main/useAppComputed'
import { useAppInterface } from './main/useAppInterface'
import { useAppEnsure } from './main/useAppEnsure'
import { useAppUpdate } from './main/useAppUpdate'

/**
 * useApp
 * - Fetches and manages the current runtime app.
 * - Always uses the FireUXConfig appId.
 * - For arbitrary app docs, call useAppFetch(appId) directly.
 */
export function useApp() {
  const { appId } = useFireUXConfig()
  const { app } = useAppFetch(appId)

  return {
    app,
    ...useAppComputed(app),
    ...useAppInterface(app),
    ...useAppEnsure(),
    ...useAppUpdate(app),
  }
}
