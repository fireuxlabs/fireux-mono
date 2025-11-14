import { useRouter } from 'vue-router'
import {
  arrayUnion,
  doc,
  getDoc,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

type EnsureUserResult = {
  createdCore: boolean
  createdApp: boolean
  id: string
  displayName: string
}

export function useUserEnsure() {
  const router = useRouter()
  const { isTenant, appId } = useFireUXConfig()

  const ensureCore = async (): Promise<{
    created: boolean
    id: string
    displayName: string
  }> => {
    const { uid, auth } = await requireUid()
    const displayName = auth?.displayName || 'New User'

    const result = await ensureCoreUserDocument(uid, {
      displayName,
      email: auth?.email ?? '',
    })

    const existing = result.snapshot?.data() as Partial<User> | undefined
    return {
      created: result.created,
      id: uid,
      displayName: existing?.display_name || displayName,
    }
  }

  const ensureApp = async (): Promise<{ created: boolean }> => {
    if (!isTenant || !appId) return { created: false }
    const { uid } = await requireUid()
    const membership = await ensureUserAppMembership(appId, uid, 'user')
    return { created: membership.created }
  }

  const ensureUser = async (): Promise<EnsureUserResult> => {
    const core = await ensureCore()
    const app = await ensureApp()

    if ((core.created || app.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return {
      createdCore: core.created,
      createdApp: app.created,
      id: core.id,
      displayName: core.displayName,
    }
  }

  return { ensureUser, ensureCore, ensureApp }
}

type EnsureCoreOptions = {
  displayName?: string
  email?: string
  avatar?: string | null
}

type EnsureCoreResult = {
  created: boolean
  snapshot?: DocumentSnapshot<User>
  displayName: string
}

export async function ensureCoreUserDocument(
  uid: string,
  options: EnsureCoreOptions = {}
): Promise<EnsureCoreResult> {
  const db = useFirestore()
  const ref = doc(db, 'users', uid)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    const data = snapshot.data() as User | undefined
    const existingName =
      data?.display_name || options.displayName || buildFallbackDisplayName(uid)
    return { created: false, snapshot, displayName: existingName }
  }

  const displayName = options.displayName || buildFallbackDisplayName(uid)
  const payload: User = {
    id: uid,
    display_name: displayName,
    avatar: options.avatar ?? '',
    email: options.email ?? '',
    handle: makeHandle(displayName, uid),
  } as User

  const { setDocument } = useFirestoreManager()
  await setDocument<User>('users', uid, payload)

  return { created: true, displayName }
}

async function ensureUserAppMembership(
  appId: string,
  uid: string,
  membershipRole: 'admin' | 'user'
) {
  const db = useFirestore()
  const ref = doc(db, 'apps', appId, 'users', uid)
  const snapshot = await getDoc(ref)
  const { setDocument, updateDocument } = useFirestoreManager()

  let created = true
  if (snapshot.exists()) {
    created = false
    const current = snapshot.data() as AppUser | undefined
    if (current && current.role !== membershipRole) {
      await updateDocument<AppUser>(`apps/${appId}/users`, uid, {
        role: membershipRole,
      })
    }
  } else {
    const payload: AppUser = {
      id: uid,
      role: membershipRole,
      creator_id: uid,
    } as AppUser
    await setDocument<AppUser>(`apps/${appId}/users`, uid, payload)
  }

  await ensureCoreUserDocument(uid)

  const membershipUpdates: Partial<User> =
    membershipRole === 'admin'
      ? {
          adminOf: arrayUnion(appId) as unknown as string[],
          userOf: arrayUnion(appId) as unknown as string[],
        }
      : {
          userOf: arrayUnion(appId) as unknown as string[],
        }

  await updateDocument<User>('users', uid, membershipUpdates)

  return { created }
}

function makeHandle(displayName: string, uid: string) {
  const base = displayName.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
  const padded = base || 'user'
  return `${padded}${uid.slice(0, 4)}`.slice(0, 12)
}

function buildFallbackDisplayName(uid: string) {
  const suffix = uid.slice(-4) || uid
  return `Member ${suffix}`
}
