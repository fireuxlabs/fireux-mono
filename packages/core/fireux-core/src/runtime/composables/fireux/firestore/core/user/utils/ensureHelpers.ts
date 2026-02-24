import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  writeBatch,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

import type { FirebaseTimestamp } from '../../../../../../../types/firebase'
import type {
  AppUser,
  User,
} from '../../../../../../models/core/user.model'
import type { NotificationScope, UserNotification } from '../../../../../../models/core/user.supporting'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import { useFirestoreManager } from '../../../operations/useFirestoreManager'

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

function normalizePublicDisplayNameSeed(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^[^\s@]+@[^\s@]+$/.test(trimmed)
    ? trimmed.split('@')[0]?.trim() || ''
    : trimmed
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
    const existingName = data?.display_name
    if (!existingName) {
      throw new Error('[ensureCoreUserDocument] Existing user missing display_name')
    }

    // Backfill canon-required fields for older documents.
    const patch: Partial<User> = {}
    if (typeof (data as any)?.avatar !== 'string') patch.avatar = ''
    if (typeof (data as any)?.handle !== 'string') patch.handle = makeHandle(existingName, uid)
    if (typeof (data as any)?.email !== 'string') patch.email = options.email ?? ''
    if (typeof (data as any)?.bio !== 'string') patch.bio = ''
    if (!Array.isArray((data as any)?.profiles)) patch.profiles = []
    if (!Array.isArray((data as any)?.userOf)) patch.userOf = []
    if (!Array.isArray((data as any)?.adminOf)) patch.adminOf = []
    if (!Array.isArray((data as any)?.notifications)) patch.notifications = []
    if (!(data as any)?.created_at) (patch as any).created_at = serverTimestamp()
    if (!(data as any)?.updated_at) (patch as any).updated_at = serverTimestamp()

    if (Object.keys(patch).length) {
      const { updateDocument } = useFirestoreManager()
      await updateDocument<User>('users', uid, patch as any)
    }

    return {
      created: false,
      snapshot: snapshot as DocumentSnapshot<User>,
      displayName: existingName,
    }
  }

  const displayName = normalizePublicDisplayNameSeed(options.displayName ?? '')
  if (!displayName) {
    throw new Error('[ensureCoreUserDocument] Missing displayName')
  }
  const email = options.email
  if (!email) {
    throw new Error('[ensureCoreUserDocument] Missing email')
  }
  // EnsureCore is responsible for creating the core document, but should not
  // create membership side effects (like notifications) by default.
  const payload: User = {
    id: uid,
    display_name: displayName,
    avatar: options.avatar ?? '',
    handle: makeHandle(displayName, uid),
    email,
    bio: '',
    profiles: [],
    userOf: [],
    adminOf: [],
    notifications: [],
    created_at: serverTimestamp() as unknown as FirebaseTimestamp,
    updated_at: serverTimestamp() as unknown as FirebaseTimestamp,
  }

  const { setDocument } = useFirestoreManager()
  await setDocument<User>('users', uid, payload, { mode: 'date' })

  return { created: true, displayName }
}

export type EnsureMembershipResult = { created: boolean }

export async function ensureUserAppMembership(
  appId: string,
  uid: string,
  membershipRole: 'admin' | 'user'
): Promise<EnsureMembershipResult> {
  await useRequireUser()
  const db = useFirestore()

  const appUserRef = doc(db, 'apps', appId, 'users', uid)
  const appRef = doc(db, 'apps', appId)
  const userRef = doc(db, 'users', uid)

  const [appUserSnap, userSnap] = await Promise.all([
    getDoc(appUserRef),
    getDoc(userRef),
  ])

  if (!userSnap.exists()) {
    throw new Error(
      `[ensureUserAppMembership] Missing core user doc for uid=${uid}; call ensureCoreUserDocument first`
    )
  }

  const created = !appUserSnap.exists()
  const batch = writeBatch(db)

  // 1) Canonical membership overlay
  if (appUserSnap.exists()) {
    const current = appUserSnap.data() as AppUser | undefined
    if (current?.role !== membershipRole) {
      batch.update(appUserRef, {
        role: membershipRole,
        updated_at: serverTimestamp(),
      })
    }
  } else {
    batch.set(
      appUserRef,
      {
        id: uid,
        role: membershipRole,
        notifications: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      } as any,
      { merge: false }
    )
  }

  // 2) App mirrors
  if (created) {
    batch.update(appRef, {
      'derived.user_count': increment(1),
      updated_at: serverTimestamp(),
    })
  }

  // Keep all admin mirrors in sync with the app-scoped role.
  // Canon: AppUser.role (apps/{appId}/users/{uid})
  // Mirrors: apps/{appId}.admin_ids[], users/{uid}.adminOf[]
  batch.update(appRef, {
    admin_ids: (membershipRole === 'admin'
      ? arrayUnion(uid)
      : arrayRemove(uid)) as unknown as string[],
    updated_at: serverTimestamp(),
  })

  // 3) Core user mirrors (and ensure core user exists)
  const membershipUpdates: any = {
    userOf: arrayUnion(appId) as unknown as string[],
    adminOf: (membershipRole === 'admin'
      ? arrayUnion(appId)
      : arrayRemove(appId)) as unknown as string[],
    updated_at: serverTimestamp(),
  }

  batch.update(userRef, membershipUpdates as any)

  await batch.commit()
  return { created }
}

export type RemoveMembershipResult = { removed: boolean }

export async function removeUserAppMembership(
  appId: string,
  uid: string
): Promise<RemoveMembershipResult> {
  await useRequireUser()
  const db = useFirestore()

  const appUserRef = doc(db, 'apps', appId, 'users', uid)
  const appRef = doc(db, 'apps', appId)
  const userRef = doc(db, 'users', uid)

  const [appUserSnap, userSnap] = await Promise.all([
    getDoc(appUserRef),
    getDoc(userRef),
  ])
  const existed = appUserSnap.exists()

  const batch = writeBatch(db)
  batch.delete(appUserRef)

  if (existed) {
    batch.update(appRef, {
      'derived.user_count': increment(-1),
      updated_at: serverTimestamp(),
    })
  }

  batch.update(appRef, {
    admin_ids: arrayRemove(uid) as unknown as string[],
    updated_at: serverTimestamp(),
  })

  if (userSnap.exists()) {
    batch.update(userRef, {
      userOf: arrayRemove(appId) as unknown as string[],
      adminOf: arrayRemove(appId) as unknown as string[],
      updated_at: serverTimestamp(),
    } as any)
  }

  await batch.commit()
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
