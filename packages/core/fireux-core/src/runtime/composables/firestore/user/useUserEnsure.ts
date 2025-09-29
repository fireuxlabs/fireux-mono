// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import { useImageStorage } from '../../firebase/useImageStorage'
import { useFirestoreCreate } from '../useFirestoreCreate'
import type {
  CoreUserDoc,
  AppUserDoc,
  User,
} from '../../../models/core/user.model'
// import { useRouter } from 'vue-router'

/**
 * Dev-simple ensure:
 * - Always ensure core user (creates if missing, uploads auth.photoURL)
 * - If tenant, ensure app user (creates if missing) reusing the core avatar URL
 * - No fallbacks/guards beyond existence checks for the docs
 */
export function useUserEnsure(_user?: Ref<User | null>) {
  const db = useFirestore()
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { uploadImage } = useImageStorage()
  // const router = useRouter()
  const { setDocument } = useFirestoreCreate()

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const auth = authRef.value! // assume solid auth object during dev

    // Fast path: if the core user is already present in the passed-in ref, skip reads/creates
    if (_user?.value?.core) {
      return { created: false, avatarUrl: _user.value.core.avatar }
    }

    const coreRef = doc(db, 'core-users', auth.uid)
    const snap = await getDoc(coreRef)
    if (snap.exists()) {
      const data = snap.data() as Partial<CoreUserDoc>
      return { created: false, avatarUrl: data?.avatar }
    }

    // Upload avatar → Storage
    const avatarUrl = await uploadImage(
      `core-users/${auth.uid}/avatar.jpg`,
      auth.photoURL as string
    )

    const payload: Partial<CoreUserDoc> = {
      id: auth.uid,
      email: auth.email!,
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
    }

    await setDocument('core-users', auth.uid, payload as CoreUserDoc)
    return { created: true, avatarUrl }
  }

  // No tenant/appId check here — ensureUser controls when this runs.
  async function ensureAppUser(
    coreAvatarUrl?: string
  ): Promise<{ created: boolean }> {
    const auth = authRef.value! // assume solid auth object during dev
    if (!appId)
      throw new Error('[ensureAppUser] missing appId in tenant context')

    // Fast path: if the app user is already present in the passed-in ref, skip reads/creates
    if (_user?.value?.app) {
      return { created: false }
    }

    const appRef = doc(db, `apps/${appId}/users`, auth.uid)
    const snap = await getDoc(appRef)
    if (snap.exists()) return { created: false }

    const payload: Partial<AppUserDoc> = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      email: auth.email!,
      avatar: coreAvatarUrl || '',
    }

    await setDocument(`apps/${appId}/users`, auth.uid, payload as AppUserDoc)
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureCoreUser()
    const app = isTenant
      ? await ensureAppUser(core.avatarUrl)
      : { created: false }

    // No navigation side-effects during dev

    return { createdCore: core.created, createdApp: app.created } as const
  }

  return { ensureUser, ensureCoreUser, ensureAppUser }
}
