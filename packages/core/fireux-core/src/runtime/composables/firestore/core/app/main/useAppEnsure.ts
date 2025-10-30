// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppEnsure.ts
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type { AppUser } from 'fireux-core/runtime/models/core/user.model.ts'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const db = useFirestore()
  const { setDocument } = useFirestoreManager()
  const { appId, ecosystem, role, appName } = useFireUXConfig()

  async function ensureAppDoc(): Promise<EnsureAppDocResult> {
    if (!appId || !ecosystem) {
      throw new Error('[ensureAppDoc] missing app configuration')
    }

    const { uid } = await requireUid()
    const ref = doc(db, 'apps', appId)
    const snap = await getDoc(ref)
    if (snap.exists()) return { created: false, id: appId }

    const payload = {
      id: appId,
      ecosystem,
      role,
      app_name: appName || appId,
      creator_id: uid,
    } as App

    await setDocument('apps', appId, payload)
    await ensureAppMembership(uid, 'admin')

    return { created: true, id: appId }
  }

  async function ensureAppMembership(
    uid: string,
    membershipRole: 'admin' | 'user' = 'user'
  ): Promise<EnsureMembershipResult> {
    if (!appId) return { created: false }

    const ref = doc(db, `apps/${appId}/users`, uid)
    const snap = await getDoc(ref)
    if (snap.exists()) return { created: false }

    const payload = {
      id: uid,
      role: membershipRole,
      creator_id: uid,
    } as AppUser

    await setDocument(`apps/${appId}/users`, uid, payload)
    return { created: true }
  }

  const ensureApp = () => ensureAppDoc()

  return { ensureApp, ensureAppDoc, ensureAppMembership }
}
