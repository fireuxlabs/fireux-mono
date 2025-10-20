// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useFirestore } from 'vuefire'
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import type {
  CoreUserDoc,
  AppUserDoc,
  User,
} from '../../../models/core/user.model'
import { useRouter } from 'vue-router'
import { useFirestoreCreate } from '../../firestore/useFirestoreCreate'
import { requireUid, ensureAvatarUrl } from '../../ensure/useEnsureCommon'

/**
 * Dev-simple ensure:
 * - Always ensure core user (creates if missing, uploads auth.photoURL)
 * - If tenant, ensure app user (creates if missing) reusing the core avatar URL
 * - No fallbacks/guards beyond existence checks for the docs
 */
export function useUserEnsure(_user?: Ref<User | null>) {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
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
      const data = snap.data() as Partial<CoreUserDoc>

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

    const payload: Partial<CoreUserDoc> = {
      id: uid,
      email: auth?.email ?? '',
      display_name: auth?.displayName || 'New User',
      avatar: avatarUrl,
      ...(isTenant && appId ? { userOf: [appId] } : {}),
    }

    await setDocument('core-users', uid, payload as CoreUserDoc)
    return { created: true, avatarUrl }
  }

  // No tenant/appId check here — ensureUser controls when this runs.
  async function ensureAppUser(): Promise<{ created: boolean }> {
    if (!isTenant || !appId) {
      return { created: false }
    }

    const { uid } = await requireUid()
    const appDocRef = doc(db, 'apps', appId)
    const appDoc = await getDoc(appDocRef)
    if (!appDoc.exists()) {
      return { created: false }
    }
    const appRef = doc(db, `apps/${appId}/users`, uid)
    const snap = await getDoc(appRef)
    if (snap.exists()) return { created: false }

    await setDocument(
      `apps/${appId}/users`,
      uid,
      {
        id: uid,
        role: 'user',
      } as Partial<AppUserDoc>
    )
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
