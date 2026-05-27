import { useFireUXConfig } from '../../../app/FireUXConfig'
import { useAppFetch } from './fetch/useAppFetch'
import { useAppCreate } from './mutations/useAppCreate'
import { useAppUpdate } from './mutations/useAppUpdate'
import { useAppComputed } from './utils/view/useAppComputed'
import { useAppInterface } from './utils/view/useAppInterface'

export type { App } from '../../../../../models/core/app.model'

/**
 * FireUX stack family: System root entity + active runtime singleton.
 * Entity: App.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 *
 * App stored truth lives at apps/{appId}. This file manages the active runtime app from FireUXConfig.appId.
 * Project/App console surfaces may manage App through a facade; they do not create a separate App identity.
 * `fireux/app` remains app shell/context/orchestration space, not App entity storage.
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
    ...useAppCreate(),
    ...useAppUpdate(app),
  }
}
