// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: preserve canonical App read errors and outcomes.
import { useFireUXConfig } from '../../../app/FireUXConfig'
import { useAppFetch } from './fetch/useAppFetch'
import { useAppCreate } from './mutations/useAppCreate'
import { useAppDelete } from './mutations/useAppDelete'
import { useAppUpdate } from './mutations/useAppUpdate'
import { useAppComputed } from './utils/view/useAppComputed'
import { useAppInterface } from './utils/view/useAppInterface'

export type { App } from '../../../../../models/core/app.model'

/**
 * FireUX stack family: System root entity + active runtime singleton.
 * Entity: App.
 *
 * App stored truth lives at apps/{appId}. This file selects the current root
 * App through FireUXConfig.appId.
 * Project/App console surfaces may manage App through a facade; they do not create a separate App identity.
 * `fireux/app` remains app shell/context/orchestration space, not App entity storage.
 * Direct Project Apps and Ecosystem Apps use the same root entity type. For any
 * For an authorized canonical App read, use useAppFetch(appId). Public and
 * cross-App presentation must use the allowlisted App detail transport.
 */
export function useApp() {
  const { appId } = useFireUXConfig()
  const { app, pending, error, outcome } = useAppFetch(appId)

  return {
    app,
    pending,
    error,
    outcome,
    ...useAppComputed(app, pending),
    ...useAppInterface(app),
    ...useAppCreate(),
    ...useAppUpdate(app),
    ...useAppDelete(),
  }
}
