// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppEnsure.ts
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import {
  ensureAppMembership as ensureAppMembershipDoc,
  ensureDoc,
} from '../../../utils/ensureCommon.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const { appId, ecosystem, role, appName } = useFireUXConfig()
  const { updateDocument } = useFirestoreManager()

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
      admin_ids: [uid],
    } as App

    const result = await ensureDoc<App>('apps', appId, payload)
    if (result.created) {
      await ensureAppMembershipDoc(appId, uid, 'admin')
    } else if (result.snapshot) {
      const current = result.snapshot.data() as App | undefined
      const adminIds = Array.isArray(current?.admin_ids)
        ? current.admin_ids
        : []
      if (!adminIds.includes(uid)) {
        const nextAdminIds = [...adminIds, uid]
        await updateDocument<App>('apps', appId, { admin_ids: nextAdminIds })
      }
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
