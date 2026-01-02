import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

import { useFirestoreManager } from '../../../operations/useFirestoreManager'
import type { App } from '../../../../../../models/core/app.model'
import type {
  AppUser,
  User,
  UserNotification,
  NotificationScope,
} from '../../../../../../models/core/user.model'

export type EnsureCoreOptions = {
  displayName?: string
  email?: string
  avatar?: string | null
  ecosystemName?: string
}

export type EnsureCoreResult = {
  created: boolean
  snapshot?: DocumentSnapshot<User>
  displayName: string
}

export type EnsureMembershipOptions = {
  appName?: string
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
    return {
      created: false,
      snapshot: snapshot as DocumentSnapshot<User>,
      displayName: existingName,
    }
  }

  const displayName = options.displayName || buildFallbackDisplayName(uid)
  const welcomeLabel = options.ecosystemName?.trim() || 'FireUX'
  const payload: User = {
    id: uid,
    display_name: displayName,
    avatar: options.avatar ?? '',
    handle: makeHandle(displayName, uid),
    email: options.email ?? '',
    bio: '',
    profiles: [],
    userOf: [],
    adminOf: [],
    notifications: [
      createUserNotification({
        message: `Welcome to ${welcomeLabel}`,
        scope: 'ecosystem',
      }),
    ],
  }

  const { setDocument } = useFirestoreManager()
  await setDocument<User>('users', uid, payload)

  return { created: true, displayName }
}

export type EnsureMembershipResult = { created: boolean }

export async function ensureUserAppMembership(
  appId: string,
  uid: string,
  membershipRole: 'admin' | 'user',
  options: EnsureMembershipOptions = {}
): Promise<EnsureMembershipResult> {
  const db = useFirestore()
  const ref = doc(db, 'apps', appId, 'users', uid)
  const snapshot = await getDoc(ref)
  const { setDocument, updateDocument } = useFirestoreManager()
  const appLabel = options.appName?.trim() || appId

  let created = true
  if (snapshot.exists()) {
    created = false
    const current = snapshot.data() as AppUser | undefined
    if (current?.role !== membershipRole) {
      await updateDocument<AppUser>(`apps/${appId}/users`, uid, {
        role: membershipRole,
      })
    }
  } else {
    const payload: AppUser = {
      id: uid,
      role: membershipRole,
      creator_id: uid,
      notifications: [
        createUserNotification({
          message: `Welcome to ${appLabel}`,
          scope: 'app',
          appId,
        }),
      ],
    } as AppUser
    await setDocument<AppUser>(`apps/${appId}/users`, uid, payload)
  }

  if (created) {
    await updateDocument<App>('apps', appId, {
      user_count: increment(1) as unknown as App['user_count'],
    })
  }

  await ensureCoreUserDocument(uid)

  let membershipUpdates: Partial<User> =
    membershipRole === 'admin'
      ? {
          adminOf: arrayUnion(appId) as unknown as string[],
          userOf: arrayUnion(appId) as unknown as string[],
        }
      : {
          userOf: arrayUnion(appId) as unknown as string[],
        }

  if (created) {
    membershipUpdates = {
      ...membershipUpdates,
      notifications: arrayUnion(
        createUserNotification({
          message: `You joined ${appLabel}`,
          scope: 'app',
          appId,
        })
      ) as unknown as UserNotification[],
    }
  }

  await updateDocument<User>('users', uid, membershipUpdates)

  return { created }
}

export type CreateNotificationInput = {
  message: string
  scope: NotificationScope
  appId?: string
}

export function createUserNotification(
  input: CreateNotificationInput
): UserNotification {
  return {
    id: generateNotificationId(),
    message: input.message,
    scope: input.scope,
    created_at: new Date().toISOString(),
    read: false,
    app_id: input.appId ?? '',
  }
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

function generateNotificationId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 12)
}
