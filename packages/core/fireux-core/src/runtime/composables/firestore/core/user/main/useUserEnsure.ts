import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'

function makeHandle(displayName: string, uid: string) {
  const base = displayName.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
  const padded = base || 'user'
  return `${padded}${uid.slice(0, 4)}`.slice(0, 12)
}

type EnsureUserDocResult = {
  created: boolean
  id: string
  displayName: string
}
type EnsureMembershipResult = { created: boolean }

export function useUserEnsure(_user?: Ref<User | null | undefined>) {
  const db = useFirestore()
  const router = useRouter()
  const { isTenant, appId } = useFireUXConfig()
  const { setDocument } = useFirestoreManager()

  async function ensureUserDoc(): Promise<EnsureUserDocResult> {
    const { uid, auth } = await requireUid()
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const existing = snap.data() as Partial<User>
      const displayName = existing.display_name || auth?.displayName || 'User'
      return { created: false, id: uid, displayName }
    }

    const displayName = auth?.displayName || 'New User'
    const payload = {
      id: uid,
      email: auth?.email ?? '',
      display_name: displayName,
      handle: makeHandle(displayName, uid),
    } as User

    await setDocument('users', uid, payload)
    return { created: true, id: uid, displayName }
  }

  async function ensureAppMembership(): Promise<EnsureMembershipResult> {
    if (!isTenant || !appId) return { created: false }

    const { uid } = await requireUid()
    const ref = doc(db, `apps/${appId}/users`, uid)
    const snap = await getDoc(ref)
    if (snap.exists()) return { created: false }

    const payload = {
      id: uid,
      role: 'user',
      creator_id: uid,
    } as AppUser

    await setDocument(`apps/${appId}/users`, uid, payload)
    return { created: true }
  }

  async function ensureUser() {
    const core = await ensureUserDoc()
    const membership = await ensureAppMembership()

    if ((core.created || membership.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return {
      createdCore: core.created,
      createdApp: membership.created,
      id: core.id,
      displayName: core.displayName,
    } as const
  }

  return {
    ensureUser,
    ensureCoreUser: ensureUserDoc,
    ensureAppUser: ensureAppMembership,
    ensureUserDoc,
    ensureAppMembership,
  }
}
