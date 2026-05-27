import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentSnapshot,
} from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

import type { FirebaseTimestamp } from '../../../../../../../types/firebase'
import type {
  AppUser,
  User,
} from '../../../../../../models/core/user.model'
import type { NotificationScope, UserNotification } from '../../../../../../models/core/supporting/user'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'

export type CreateCoreOptions = {
  displayName?: string
  email?: string
  avatar?: string | null
  ecosystemName?: string
}

export type CreateCoreResult = {
  created: boolean
  snapshot?: DocumentSnapshot<User>
  displayName: string
  handle: string
}

function normalizePublicDisplayNameSeed(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^[^\s@]+@[^\s@]+$/.test(trimmed)
    ? trimmed.split('@')[0]?.trim() || ''
    : trimmed
}

function resolveCoreUserAvatar(avatar?: string | null): string {
  const explicit = typeof avatar === 'string' ? avatar.trim() : ''
  if (explicit) return explicit
  return ''
}

export async function createCoreUserDocument(
  uid: string,
  options: CreateCoreOptions = {}
): Promise<CreateCoreResult> {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const db = useFirestore(identityDatabaseId)
  const ref = doc(db, 'users', uid)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    const data = snapshot.data() as User | undefined
    const existingName = data?.display_name
    if (!existingName) {
      throw new Error('[createCoreUserDocument] Existing user missing display_name')
    }

    // Normalize canon-required fields without inventing identity data.
    const patch: Record<string, unknown> = {}
    const resolvedHandle =
      typeof data?.handle === 'string' && data.handle.trim()
        ? data.handle.trim()
        : makeHandle(existingName, uid)
    const existingAvatar = (data as any)?.avatar
    if (typeof existingAvatar !== 'string' || !existingAvatar.trim()) {
      patch.avatar = resolveCoreUserAvatar(options.avatar)
    }
    if (typeof (data as any)?.handle !== 'string' || !(data as any)?.handle?.trim()) {
      patch.handle = resolvedHandle
    }
    if (typeof (data as any)?.email !== 'string') patch.email = options.email ?? ''
    if (typeof (data as any)?.bio !== 'string') patch.bio = ''
    if (!Array.isArray((data as any)?.profiles)) patch.profiles = []
    if (!Array.isArray((data as any)?.projects)) patch.projects = []
    if (!Array.isArray((data as any)?.userOf)) patch.userOf = []
    if (!Array.isArray((data as any)?.adminOf)) patch.adminOf = []
    if (!Array.isArray((data as any)?.notifications)) patch.notifications = []
    if (!((data as any)?.created && (data as any)?.created.at)) {
      (patch as any)['created.at'] = (data as any)?.created_at ?? serverTimestamp()
    }

    if (Object.keys(patch).length) {
      const { updateDocument } = useFirestoreUpdate({
        databaseId: identityDatabaseId,
      })
      await updateDocument<User>('users', uid, patch as any)
    }

    return {
      created: false,
      snapshot: snapshot as DocumentSnapshot<User>,
      displayName: existingName,
      handle: resolvedHandle,
    }
  }

  const displayName = normalizePublicDisplayNameSeed(options.displayName ?? '')
  if (!displayName) {
    throw new Error('[createCoreUserDocument] Missing displayName')
  }
  const email = options.email
  if (!email) {
    throw new Error('[createCoreUserDocument] Missing email')
  }
  const resolvedAvatar = resolveCoreUserAvatar(options.avatar)
  // Core user create is responsible for the core document, but should not
  // create membership side effects (like notifications) by default.
  const handle = makeHandle(displayName, uid)
  const payload = {
    display_name: displayName,
    avatar: resolvedAvatar,
    handle,
    email,
    bio: '',
    profiles: [],
    projects: [],
    userOf: [],
    adminOf: [],
    notifications: [],
  }

  const { setDocument } = useFirestoreCreate({
    databaseId: identityDatabaseId,
  })
  await setDocument<User>('users', uid, payload as unknown as User)

  return { created: true, displayName, handle }
}

export type CreateMembershipResult = { created: boolean }

export async function createUserAppMembership(
  appId: string,
  uid: string,
  membershipRole: 'admin' | 'user'
): Promise<CreateMembershipResult> {
  const actor = await useRequireUser()
  const appDb = useFirestore()
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())

  const appUsersRef = collection(appDb, 'apps', appId, 'users')
  const appUserRef = doc(appDb, 'apps', appId, 'users', uid)
  const appRef = doc(appDb, 'apps', appId)
  const userRef = doc(identityDb, 'users', uid)

  const [appUserSnap, appSnap, userSnap] = await Promise.all([
    getDoc(appUserRef),
    getDoc(appRef),
    getDoc(userRef),
  ])

  if (!appSnap.exists()) {
    throw new Error(
      `[createUserAppMembership] Missing app doc for appId=${appId}; call createApp first`
    )
  }

  if (!userSnap.exists()) {
    throw new Error(
      `[createUserAppMembership] Missing core user doc for uid=${uid}; call createCoreUserDocument first`
    )
  }

  const created = !appUserSnap.exists()
  const appData = (appSnap.data() as Record<string, any> | undefined) ?? {}
  const existingCount = Number(appData?.derived?.user_count)
  const countLooksBroken =
    !Number.isFinite(existingCount) || existingCount < (created ? 0 : 1)
  let repairedUserCount: number | null = null

  if (countLooksBroken) {
    try {
      repairedUserCount = Math.max(
        (await getCountFromServer(appUsersRef)).data().count,
        created ? 0 : 1
      )
    } catch (error) {
      repairedUserCount = created ? 0 : 1
      if (import.meta.dev) {
        console.warn('[createUserAppMembership] failed to repair user count exactly', {
          appId,
          uid,
          error,
        })
      }
    }
  }
  const batch = writeBatch(appDb)

  // 1) Canonical membership overlay
  if (appUserSnap.exists()) {
    const current = appUserSnap.data() as AppUser | undefined
    const patch: Record<string, unknown> = {}

    if (current?.role !== membershipRole) {
      patch.role = membershipRole
    }
    if (typeof (current as any)?.is_premium !== 'boolean') {
      patch.is_premium = false
    }
    if (typeof (current as any)?.console_enabled !== 'boolean') {
      patch.console_enabled = membershipRole === 'admin'
    }
    if (!Array.isArray((current as any)?.console_scopes)) {
      patch.console_scopes = []
    }

    if (Object.keys(patch).length) {
      batch.update(appUserRef, {
        ...patch,
        updated: {
          at: serverTimestamp(),
          by: actor.uid,
        },
      })
    }
  } else {
    batch.set(
      appUserRef,
      {
        role: membershipRole,
        is_premium: false,
        console_enabled: membershipRole === 'admin',
        console_scopes: [],
        notifications: [],
        created: {
          at: serverTimestamp(),
          by: actor.uid,
          app_id: appId,
        },
        updated: {
          at: serverTimestamp(),
          by: actor.uid,
        },
      } as any,
      { merge: false }
    )
  }

  // 2) App mirrors
  const appPatch: Record<string, unknown> = {
    admin_ids: (membershipRole === 'admin'
      ? arrayUnion(uid)
      : arrayRemove(uid)) as unknown as string[],
    updated: {
      at: serverTimestamp(),
      by: actor.uid,
    },
  }

  if (created) {
    appPatch['derived.user_count'] =
      repairedUserCount === null ? increment(1) : repairedUserCount + 1
  } else if (repairedUserCount !== null) {
    appPatch['derived.user_count'] = repairedUserCount
  }

  // Keep all admin mirrors in sync with the app-scoped role.
  // Canon: AppUser.role (apps/{appId}/users/{uid})
  // Mirrors: apps/{appId}.admin_ids[], users/{uid}.adminOf[]
  batch.update(appRef, appPatch as any)

  // 3) Core user mirrors (ecosystem identity database)
  const membershipUpdates: any = {
    userOf: arrayUnion(appId) as unknown as string[],
    adminOf: (membershipRole === 'admin'
      ? arrayUnion(appId)
      : arrayRemove(appId)) as unknown as string[],
    updated: {
      at: serverTimestamp(),
      by: actor.uid,
    },
  }

  await batch.commit()
  await updateDoc(userRef, membershipUpdates as any)
  return { created }
}

export type RemoveMembershipResult = { removed: boolean }

export async function removeUserAppMembership(
  appId: string,
  uid: string
): Promise<RemoveMembershipResult> {
  const actor = await useRequireUser()
  const appDb = useFirestore()
  const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())

  const appUserRef = doc(appDb, 'apps', appId, 'users', uid)
  const appRef = doc(appDb, 'apps', appId)
  const userRef = doc(identityDb, 'users', uid)

  const [appUserSnap, userSnap] = await Promise.all([
    getDoc(appUserRef),
    getDoc(userRef),
  ])
  const existed = appUserSnap.exists()

  const batch = writeBatch(appDb)
  batch.delete(appUserRef)

  if (existed) {
    batch.update(appRef, {
      'derived.user_count': increment(-1),
      updated: {
        at: serverTimestamp(),
        by: actor.uid,
      },
    })
  }

  batch.update(appRef, {
    admin_ids: arrayRemove(uid) as unknown as string[],
    updated: {
      at: serverTimestamp(),
      by: actor.uid,
    },
  })

  await batch.commit()
  if (userSnap.exists()) {
    await updateDoc(userRef, {
      userOf: arrayRemove(appId) as unknown as string[],
      adminOf: arrayRemove(appId) as unknown as string[],
      updated: {
        at: serverTimestamp(),
        by: actor.uid,
      },
    } as any)
  }
  return { removed: existed }
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
    message: input.message,
    scope: input.scope,
    created: {
      at: serverTimestamp() as unknown as FirebaseTimestamp,
      app_id: input.appId ?? '',
    },
    read: false,
  }
}

function makeHandle(displayName: string, uid: string) {
  // Strict rule: NEVER invent a word fallback.
  // Deterministic handle: cleaned displayName prefix (may be empty) + uid suffix.
  const cleaned = displayName.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
  const suffix = uid.slice(0, 8)
  const combined = `${cleaned}${suffix}`.slice(0, 12)
  if (!combined) throw new Error('[makeHandle] Unable to derive handle')
  return combined
}
