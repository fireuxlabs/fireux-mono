// Concurrent edit — 2026-07-20 15:44 CEST — Repo Efficiency Pass 1 of 6: preserve canonical App read errors and outcomes.
import { useAppRead } from './useAppRead'
import { computed, unref, type MaybeRef } from 'vue'
import { useAppUpdate } from './useAppUpdate'
import { useFireUXConfig } from './config/FireUXConfig'
import { useAppDelete } from './useAppDelete'

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
 * Creation belongs to the trusted initializeConfiguredApp workflow; it creates
 * the required Ecosystem relationship and initial administrator membership.
 * CRUD deletion removes only the App root document and does not cascade.
 */
export function useApp(id?: MaybeRef<string | null | undefined>) {
  const config = useFireUXConfig()
  const appId = computed(() => String(unref(id) || config.appId || '').trim())
  const { app, pending, error, outcome } = useAppRead(appId)
  const { updateApp } = useAppUpdate(appId)
  const { deleteApp } = useAppDelete()

  return {
    read: { data: app, pending, error, outcome },
    update: updateApp,
    delete: () => deleteApp(appId.value),
  }
}
