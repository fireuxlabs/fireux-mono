import type { Ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import { useMediaStorage } from '../../firebase/useMediaStorage'
import { useAvatarProxy } from '../../app/utils/useAvatarProxy'
import { useUserState } from '../../state/useUserState'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'

/**
 * Create the user (core + optional app) if missing.
 * - No overwrite: if doc exists, we leave it alone.
 * - Uploads/derives a safe avatar for core if needed.
 */
export function useUserEnsure(userArg?: Ref<User | null>) {
  const db = useFirestore()
  const authRef = useCurrentUser()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { uploadCoreAvatar, getDefaultAvatarUrl } = useMediaStorage()
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const isDev = typeof process !== 'undefined' && (process as any).dev === true
  const dlog = (...args: any[]) => {
    if (isDev) console.log('[avatar-trace][useUserEnsure]', ...args)
  }

  // fallback to global state if a ref isn't provided
  const { user: userState } = useUserState()
  const user = userArg ?? userState

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const auth = authRef.value
    if (!auth?.uid || !auth?.email) return { created: false }

    const coreRef = doc(db, 'core-users', auth.uid)
    const snap = await getDoc(coreRef)
    if (snap.exists()) {
      dlog('core:exists', { uid: auth.uid })
      return { created: false, avatarUrl: (snap.data() as CoreUserDoc)?.avatar }
    }

    // pick a safe source for avatar
    const source =
      user.value?.core?.avatar || auth.photoURL || getDefaultAvatarUrl()
    const uploadSource =
      typeof source === 'string' ? getProxiedAvatarUrl(source) : source
    dlog('core:create:source', {
      uid: auth.uid,
      hasPhotoURL: !!auth.photoURL,
      source: typeof source === 'string' ? source : 'file',
    })
    if (typeof uploadSource === 'string' && uploadSource !== source) {
      dlog('core:create:source:proxied', { uid: auth.uid, uploadSource })
    }

    const avatarUrl = await uploadCoreAvatar(uploadSource, auth.uid)
    if (!avatarUrl || avatarUrl.startsWith('data:')) {
      throw new Error(
        '[useUserEnsure] Avatar upload did not return a Storage URL'
      )
    }

    const payload: Partial<CoreUserDoc> = {
      id: auth.uid,
      email: auth.email,
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
    }

    await setDoc(coreRef, payload, { merge: false })
    dlog('core:create:done', { uid: auth.uid })
    return { created: true, avatarUrl }
  }

  async function ensureAppUser(
    coreAvatarUrl?: string
  ): Promise<{ created: boolean }> {
    if (!isTenant || !appId) return { created: false }
    const auth = authRef.value
    if (!auth?.uid) return { created: false }

    const appRef = doc(db, `apps/${appId}/users`, auth.uid)
    const snap = await getDoc(appRef)
    if (snap.exists()) {
      dlog('app:exists', { uid: auth.uid, appId })
      return { created: false }
    }

    const payload: Partial<AppUserDoc> = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      avatar: coreAvatarUrl || user.value?.app?.avatar || getDefaultAvatarUrl(),
    }

    await setDoc(appRef, payload, { merge: false })
    dlog('app:create:done', { uid: auth.uid, appId })
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureCoreUser()
    const app = await ensureAppUser(core.avatarUrl)
    return { createdCore: core.created, createdApp: app.created } as const
  }

  return { ensureUser }
}
