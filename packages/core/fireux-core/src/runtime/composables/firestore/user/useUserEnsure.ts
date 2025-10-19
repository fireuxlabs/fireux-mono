// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts
import { shallowRef, type Ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import { useImageStorage } from '../../firebase/useImageStorage'
import type {
  CoreUserDoc,
  AppUserDoc,
  User,
} from '../../../models/core/user.model'
import { useRouter } from 'vue-router'
import type { User as FirebaseUser } from 'firebase/auth'

/**
 * Dev-simple ensure:
 * - Always ensure core user (creates if missing, uploads auth.photoURL)
 * - If tenant, ensure app user (creates if missing) reusing the core avatar URL
 * - No fallbacks/guards beyond existence checks for the docs
 */
export function useUserEnsure(_user?: Ref<User | null>) {
  const db = useFirestore()
  const authRef = import.meta.client
    ? (useCurrentUser() as Ref<FirebaseUser | null>)
    : (shallowRef<FirebaseUser | null>(null) as ReturnType<
        typeof useCurrentUser
      >)
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { uploadImage, getDefaultImageUrl } = useImageStorage()
  const router = useRouter()

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const auth = authRef.value
    if (!auth?.uid) {
      throw new Error('[ensureCoreUser] Missing authenticated user')
    }

    const coreRef = doc(db, 'core-users', auth.uid)
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

    // Upload avatar → Storage; if upload fails fallback to defaults
    const source = (auth.photoURL as string) || getDefaultImageUrl()
    let avatarUrl = ''

    try {
      avatarUrl = await uploadImage(`core-users/${auth.uid}/avatar`, source)
    } catch (error) {
      const message = (() => {
        if (error instanceof Error) return error.message
        if (typeof error === 'string') return error
        try {
          return JSON.stringify(error)
        } catch {
          return `${error}`
        }
      })()
      if (import.meta.dev) {
        console.warn('[ensureCoreUser] Avatar upload fallback:', message)
      }
      avatarUrl =
        typeof auth.photoURL === 'string' && auth.photoURL.length
          ? auth.photoURL
          : getDefaultImageUrl()
    }

    const now = serverTimestamp()

    const payload: CoreUserDoc = {
      id: auth.uid,
      email: auth.email ?? '',
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
      created_at: now as unknown as CoreUserDoc['created_at'],
      updated_at: now as unknown as CoreUserDoc['updated_at'],
      ...(isTenant && appId ? { userOf: [appId] } : {}),
    }

    await setDoc(coreRef, payload, { merge: false })
    return { created: true, avatarUrl }
  }

  // No tenant/appId check here — ensureUser controls when this runs.
  async function ensureAppUser(
    coreAvatarUrl?: string
  ): Promise<{ created: boolean }> {
    const auth = authRef.value
    if (!auth?.uid) {
      throw new Error('[ensureAppUser] Missing authenticated user')
    }
    if (!appId)
      throw new Error('[ensureAppUser] missing appId in tenant context')
    const appRef = doc(db, `apps/${appId}/users`, auth.uid)
    const snap = await getDoc(appRef)
    if (snap.exists()) return { created: false }

    const now = serverTimestamp()

    const payload: AppUserDoc = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      avatar: coreAvatarUrl || '',
      created_at: now as unknown as AppUserDoc['created_at'],
      updated_at: now as unknown as AppUserDoc['updated_at'],
    }

    await setDoc(appRef, payload, { merge: false })
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureCoreUser()
    const app = isTenant
      ? await ensureAppUser(core.avatarUrl)
      : { created: false }

    if ((core.created || app.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return { createdCore: core.created, createdApp: app.created } as const
  }

  return { ensureUser, ensureCoreUser, ensureAppUser }
}
