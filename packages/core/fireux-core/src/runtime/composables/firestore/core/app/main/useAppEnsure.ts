// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppEnsure.ts
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import {
  ensureAppMembership as ensureAppMembershipDoc,
  ensureDoc,
} from '../../../utils/ensureCommon.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const { appId, ecosystem, role, appName } = useFireUXConfig()

  async function ensureAppDoc(): Promise<EnsureAppDocResult> {
    if (!appId || !ecosystem) {
      throw new Error('[ensureAppDoc] missing app configuration')
    }

    const { uid } = await requireUid()
    const payload = {
      id: appId,
      ecosystem,
      role,
      app_name: appName || appId,
      creator_id: uid,
    } as App

    const result = await ensureDoc<App>('apps', appId, payload)
    if (result.created) {
      await ensureAppMembershipDoc(appId, uid, 'admin')
    }

    return { created: result.created, id: appId }
  }

  async function ensureAppMembership(
    uid: string,
    membershipRole: 'admin' | 'user' = 'user'
  ): Promise<EnsureMembershipResult> {
    if (!appId) return { created: false }
    return ensureAppMembershipDoc(appId, uid, membershipRole)
  }

  const ensureApp = () => ensureAppDoc()

  return { ensureApp, ensureAppDoc, ensureAppMembership }
}
