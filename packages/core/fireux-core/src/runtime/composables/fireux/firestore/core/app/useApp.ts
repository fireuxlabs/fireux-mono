import { useFireUXConfig } from '../../../app/FireUXConfig'
import { useAppFetch } from './fetch/useAppFetch'
import { useAppEnsure } from './mutations/useAppEnsure'
import { useAppUpdate } from './mutations/useAppUpdate'
import { useAppComputed } from './utils/view/useAppComputed'
import { useAppInterface } from './utils/view/useAppInterface'

export type { App } from '../../../../../models/core/app.model'

/**
 * FireUX stack family: Active runtime singleton.
 * Entity: App.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * This file manages the active runtime app from FireUXConfig.appId.
 * For arbitrary app ids, use useAppFetch(appId).
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
