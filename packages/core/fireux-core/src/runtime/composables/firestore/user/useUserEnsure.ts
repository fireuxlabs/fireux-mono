import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useMediaStorage } from '../../firebase/useMediaStorage'
import { useUserState } from '../../state/useUserState'
import type {
  User,
  CoreUserDoc,
  AppUserDoc,
} from '../../../models/core/user.model'

export function useUserEnsure(userArg?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { appId, role } = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()
  const { uploadCoreAvatar, getDefaultAvatarUrl } = useMediaStorage()
  const isTenant = role === 'tenant'

  const { user: userState } = useUserState()
  const user = userArg ?? userState

  async function ensureCoreUser(): Promise<string | undefined> {
    const auth = authRef.value
    if (!auth?.uid || !auth?.email) return

    const source =
      user.value?.core?.avatar || auth.photoURL || getDefaultAvatarUrl()

    let avatarUrl: string | undefined
    try {
      avatarUrl = await uploadCoreAvatar(source, auth.uid)
    } catch (e) {
      console.warn('[useUserEnsure] Avatar upload failed, using default:', e)
      avatarUrl = getDefaultAvatarUrl()
    }

    const payload: Partial<CoreUserDoc> = {
      id: auth.uid,
      email: auth.email,
      display_name: auth.displayName || 'New User',
      avatar: avatarUrl,
    }

    await setDocument('core-users', auth.uid, payload)
    return avatarUrl
  }

  async function ensureAppUser(coreAvatarUrl?: string) {
    if (!isTenant || !appId) return
    const auth = authRef.value
    if (!auth?.uid) return

    const payload: Partial<AppUserDoc> & Record<string, any> = {
      id: auth.uid,
      role: 'user',
      display_name: auth.displayName || 'New User',
      avatar: coreAvatarUrl || user.value?.app?.avatar || getDefaultAvatarUrl(),
    }

    await setDocument(`apps/${appId}/users`, auth.uid, payload)
  }

  async function ensureUser() {
    const avatarUrl = await ensureCoreUser()
    await ensureAppUser(avatarUrl)
  }

  return { ensureUser }
}
