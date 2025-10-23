// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useFirestore } from 'vuefire'
import { doc, getDoc, arrayUnion } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { User } from './useUser.ts'
import { useRouter } from 'vue-router'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import { requireUid, ensureAvatarUrl } from '../../utils/useEnsureCommon.ts'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'

export function useUserEnsure(_user?: Ref<User | null>) {
  const db = useFirestore()
  const { isTenant, appId } = useFireUXConfig()
  const router = useRouter()
  const { setDocument, updateDocument } = useFirestoreManager()
  const { app } = useApp() // reactive: truthy only if the app doc exists

  async function ensureCoreUser(): Promise<{
    created: boolean
    id: string
    displayName: string
  }> {
    const { uid, auth } = await requireUid()
    const coreRef = doc(db, 'core-users', uid)
    const snap = await getDoc(coreRef)

    if (snap.exists()) {
      const data = snap.data() as any
      // Only record tenant membership if the tenant app exists
      if (isTenant && appId && app.value && !data?.userOf?.includes(appId)) {
        await updateDocument('core-users', uid, {
          userOf: arrayUnion(appId) as unknown as string[],
        } as any)
      }
      return {
        created: false,
        id: uid,
        displayName: data?.display_name || auth?.displayName || 'User',
      }
    }

    // Create new core user
    const displayName = auth?.displayName || 'New User'
    const avatarUrl = await ensureAvatarUrl(
      `core-users/${uid}/avatar`,
      [auth?.photoURL],
      true
    )

    await setDocument('core-users', uid, {
      id: uid,
      email: auth?.email ?? '',
      display_name: displayName,
      avatar: avatarUrl,
      ...(isTenant && appId && app.value ? { userOf: [appId] } : {}),
    } as any)

    return { created: true, id: uid, displayName }
  }

  async function ensureAppUser(): Promise<{ created: boolean }> {
    if (!isTenant || !appId || !app.value) return { created: false }

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
    const appRes = await ensureAppUser()

    if ((core.created || appRes.created) && import.meta.client) {
      console.log(
        '[ensureUser] createdCore/app:',
        core.created,
        appRes.created,
        core.id,
        core.displayName
      )
      router.push('/dashboard')
    }

    return {
      createdCore: core.created,
      createdApp: appRes.created,
      id: core.id,
      displayName: core.displayName,
    } as const
  }

  return { ensureUser, ensureCoreUser, ensureAppUser }
}
