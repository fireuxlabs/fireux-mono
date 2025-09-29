// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserEnsure.ts
import type { Ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import { useImageStorage } from '../../firebase/useImageStorage'
import { useFirestoreCreate } from '../../firestore/useFirestoreCreate'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'
import { useRouter } from 'vue-router'

export function useUserEnsure(userRef: Ref<User | null>) {
  const db = useFirestore()
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { uploadImage } = useImageStorage()
  const { setDocument } = useFirestoreCreate()
  const router = useRouter()

  async function ensureCoreUser(): Promise<{
    created: boolean
    avatarUrl?: string
  }> {
    const auth = authRef.value
    if (!auth?.uid || !auth?.email) return { created: false }

    // Fast-path: already loaded in userRef
    if (userRef.value?.core?.id === auth.uid) {
      return { created: false, avatarUrl: userRef.value.core?.avatar }
    }

    // Guard against hydration delay
    const coreRef = doc(db, 'core-users', auth.uid)
    const coreSnap = await getDoc(coreRef)
    if (coreSnap.exists()) {
      const existing = coreSnap.data() as Partial<CoreUserDoc>
      return { created: false, avatarUrl: existing?.avatar }
    }

    if (!auth.photoURL)
      throw new Error('[ensureCoreUser] no photoURL on auth user')

    // Upload Google photo → Storage
    const avatarUrl = await uploadImage(
      `core-users/${auth.uid}/avatar`,
      auth.photoURL
    )

    const payload: CoreUserDoc = {
      id: auth.uid,
      email: auth.email,
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
      created_at: undefined as any, // stamped in setDocument
    }

    await setDocument('core-users', auth.uid, payload)
    console.log('[ensure core] created')
    return { created: true, avatarUrl }
  }

  async function ensureAppUser(
    coreAvatarUrl?: string
  ): Promise<{ created: boolean }> {
    if (!isTenant || !appId) return { created: false }
    const auth = authRef.value
    if (!auth?.uid) return { created: false }

    // Fast-path: already loaded
    if (userRef.value?.app?.id === auth.uid) return { created: false }

    // Check Firestore
    const appRef = doc(db, `apps/${appId}/users`, auth.uid)
    const appSnap = await getDoc(appRef)
    if (appSnap.exists()) return { created: false }

    const avatar = coreAvatarUrl || userRef.value?.core?.avatar || '' // reuse core avatar; no re-upload

    const payload: AppUserDoc = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      avatar,
      created_at: undefined as any, // stamped in setDocument
    }

    await setDocument(`apps/${appId}/users`, auth.uid, payload)
    console.log('[ensure app] created')
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
