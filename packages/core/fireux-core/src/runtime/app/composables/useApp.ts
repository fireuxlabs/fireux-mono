// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: preserve canonical App read errors and outcomes.
import { useAppRead } from './firestore/fetch/useAppRead'
import { useAppUpdate } from './firestore/mutations/useAppUpdate'
import { useFireUXConfig } from './config/FireUXConfig'
import { useAppComputed } from './useAppComputed'
import { useAppInterface } from './useAppInterface'

export type { App } from '../models/app.model.ts'

/**
 * FireUX stack family: System root entity + active runtime singleton.
 * Entity: App.
 *
 * App stored truth lives at apps/{appId}. This file selects the current root
 * App through FireUXConfig.appId.
 * Project/App workspace surfaces may manage App through a facade; they do not create a separate App identity.
 * `fireux/app` owns App runtime orchestration, not App entity storage.
 * Direct Project Apps and Ecosystem Apps use the same root entity type.
 * For an authorized canonical App read, use useAppRead(appId). Public and
 * cross-App presentation must use the allowlisted App detail transport.
 * Configured-runtime initialization is a trusted Server operation rather than
 * a browser App-create command. App deletion is not an exposed capability.
 */
export function useApp() {
  const { appId } = useFireUXConfig()
  const { app, pending, error, outcome } = useAppRead(appId)
  const update = useAppUpdate(app)

  return {
    app,
    pending,
    error,
    outcome,
    update,
    ...useAppComputed(app, pending),
    ...useAppInterface(app),
  }
}
