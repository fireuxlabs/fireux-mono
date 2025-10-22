// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useFirestore } from 'vuefire'
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { User } from './useUser.ts'
import { useRouter } from 'vue-router'
import { useFirestoreCreate } from '../../operations/useFirestoreCreate.ts'
import { requireUid, ensureAvatarUrl } from '../../utils/useEnsureCommon.ts'

export function useUserEnsure(_user?: Ref<User | null>) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const router = useRouter()
  const { setDocument } = useFirestoreCreate()

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const { uid, auth } = await requireUid()

    const coreRef = doc(db, 'core-users', uid)
    const snap = await getDoc(coreRef)
    if (snap.exists()) {
      const data = snap.data() as any
      if (isTenant && appId && !data?.userOf?.includes(appId)) {
        await updateDoc(coreRef, {
          userOf: arrayUnion(appId),
          updated_at: serverTimestamp(),
        })
      }
      return { created: false, avatarUrl: data?.avatar }
    }

    const avatarUrl = await ensureAvatarUrl(
      `core-users/${uid}/avatar`,
      [auth?.photoURL],
      true
    )

    await setDocument('core-users', uid, {
      id: uid,
      email: auth?.email ?? '',
      display_name: auth?.displayName || 'New User',
      avatar: avatarUrl,
      ...(isTenant ? { userOf: [appId] } : {}),
    } as any)

    return { created: true, avatarUrl }
  }

  async function ensureAppUser(): Promise<{ created: boolean }> {
    if (!isTenant || !appId) return { created: false }

    const { uid } = await requireUid()
    const appUserRef = doc(db, `apps/${appId}/users`, uid)
    const snap = await getDoc(appUserRef)
    if (snap.exists()) return { created: false }

    await setDocument(`apps/${appId}/users`, uid, {
      id: uid,
      role: 'user',
    } as any)
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureCoreUser()
    const app = await ensureAppUser()

    if ((core.created || app.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return { createdCore: core.created, createdApp: app.created } as const
  }

  return { ensureUser, ensureCoreUser, ensureAppUser }
}
