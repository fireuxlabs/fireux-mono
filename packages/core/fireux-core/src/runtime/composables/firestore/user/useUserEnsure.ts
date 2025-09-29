// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import { useImageStorage } from '../../firebase/useImageStorage'
import { useMediaStorage } from '../../firebase/useMediaStorage'
import type {
  CoreUserDoc,
  AppUserDoc,
  User,
} from '../../../models/core/user.model'
import { useRouter } from 'vue-router'

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
  const { getDefaultAvatarUrl } = useMediaStorage()
  const router = useRouter()

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const auth = authRef.value! // assume solid auth object during dev

    const coreRef = doc(db, 'core-users', auth.uid)
    const snap = await getDoc(coreRef)
    if (snap.exists()) {
      const data = snap.data() as Partial<CoreUserDoc>
      return { created: false, avatarUrl: data?.avatar }
    }

    // Upload avatar → Storage; if no auth photo, use default image
    const source = (auth.photoURL as string) || getDefaultAvatarUrl()
    const avatarUrl = await uploadImage(
      `core-users/${auth.uid}/avatar`,
      source
    )

    const payload: Partial<CoreUserDoc> = {
      id: auth.uid,
      email: auth.email!,
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
    }

    await setDoc(coreRef, payload as CoreUserDoc, { merge: false })
    return { created: true, avatarUrl }
  }

  // No tenant/appId check here — ensureUser controls when this runs.
  async function ensureAppUser(
    coreAvatarUrl?: string
  ): Promise<{ created: boolean }> {
    const auth = authRef.value! // assume solid auth object during dev
    if (!appId)
      throw new Error('[ensureAppUser] missing appId in tenant context')
    const appRef = doc(db, `apps/${appId}/users`, auth.uid)
    const snap = await getDoc(appRef)
    if (snap.exists()) return { created: false }

    const payload: Partial<AppUserDoc> = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      avatar: coreAvatarUrl || '',
    }

    await setDoc(appRef, payload as AppUserDoc, { merge: false })
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureCoreUser()
    const app = isTenant
      ? await ensureAppUser(core.avatarUrl)
      : { created: false }

    if (core.created || app.created) {
      router.push('/dashboard')
    }

    return { createdCore: core.created, createdApp: app.created } as const
  }

  return { ensureUser, ensureCoreUser, ensureAppUser }
}
