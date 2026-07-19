import {
  arrayRemove,
  arrayUnion,
  doc,
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
  UserApp,
  User,
} from '../../../../../../models/core/user.model'
import {
  UserAppConsoleTargetsModel,
  UserAppStorage,
  UserStorage,
} from '../../../../../../models/core/user.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import type { NotificationScope, UserNotification } from '../../../../../../models/core/supporting/user'
import {
  isLegacyUserAvatarPlaceholder,
  resolveUserAvatarSource,
} from '../../../../../../models/core/supporting/user-avatar'
import { useRequireUser } from '../../../../firebase/useRequireUser'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'

export type CreateCoreOptions = {
  displayName?: string
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
  return resolveUserAvatarSource(avatar)
}

export async function createCoreUserDocument(
  uid: string,
  options: CreateCoreOptions = {}
): Promise<CreateCoreResult> {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const db = useFirestore(identityDatabaseId)
  const ref = doc(db, UserStorage.rootCollection, uid)
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
    if (isLegacyUserAvatarPlaceholder(existingAvatar)) {
      patch.avatar = resolveUserAvatarSource('')
    } else if (typeof existingAvatar !== 'string' || !existingAvatar.trim()) {
      patch.avatar = resolveCoreUserAvatar(options.avatar)
    }
    if (typeof (data as any)?.handle !== 'string' || !(data as any)?.handle?.trim()) {
      patch.handle = resolvedHandle
    }
    if (!Array.isArray((data as any)?.app_ids)) patch.app_ids = []
    if (!Array.isArray((data as any)?.profiles)) patch.profiles = []
    if (!((data as any)?.created && (data as any)?.created.at)) {
      (patch as any)['created.at'] = (data as any)?.created_at ?? serverTimestamp()
    }

    if (Object.keys(patch).length) {
      const { updateDocument } = useFirestoreUpdate({
        databaseId: identityDatabaseId,
      })
      await updateDocument<User>(UserStorage.rootCollection, uid, patch as any)
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
  const resolvedAvatar = resolveCoreUserAvatar(options.avatar)
  // Core user create is responsible for the core document, but should not
  // create membership side effects (like notifications) by default.
  const handle = makeHandle(displayName, uid)
  const payload = {
    display_name: displayName,
    avatar: resolvedAvatar,
    handle,
    app_ids: [],
    profiles: [],
  }

  const { setDocument } = useFirestoreCreate({
    databaseId: identityDatabaseId,
  })
  await setDocument<User>(UserStorage.rootCollection, uid, payload as unknown as User)

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

  const appUserRef = doc(appDb, AppStorage.collection, appId, UserAppStorage.collection, uid)
  const appRef = doc(appDb, AppStorage.collection, appId)
  const userRef = doc(identityDb, UserStorage.rootCollection, uid)

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
  const batch = writeBatch(appDb)

  // 1) Canonical membership overlay
  if (appUserSnap.exists()) {
    const current = appUserSnap.data() as UserApp | undefined
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
    const currentTargets =
      (current as any)?.console_targets &&
      typeof (current as any).console_targets === 'object' &&
      !Array.isArray((current as any).console_targets)
        ? (current as any).console_targets
        : {}
    const needsConsoleTargets = Object.keys(UserAppConsoleTargetsModel).some(
      (field) => !Array.isArray(currentTargets[field])
    )
    if (needsConsoleTargets) {
      patch.console_targets = {
        ...UserAppConsoleTargetsModel,
        ...currentTargets,
      }
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
        console_targets: UserAppConsoleTargetsModel,
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
    appPatch['derived.user_count'] = countLooksBroken ? 1 : increment(1)
  } else if (countLooksBroken) {
    appPatch['derived.user_count'] = 1
  }

  // Keep all admin mirrors in sync with the app-scoped role.
  // Canon: UserApp.role (apps/{appId}/users/{uid})
  // Public relationship index: users/{uid}.app_ids[]
  batch.update(appRef, appPatch as any)

  // 3) Core user mirrors (ecosystem identity database)
  const membershipUpdates: any = {
    app_ids: arrayUnion(appId) as unknown as string[],
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

  const appUserRef = doc(appDb, AppStorage.collection, appId, UserAppStorage.collection, uid)
  const appRef = doc(appDb, AppStorage.collection, appId)
  const userRef = doc(identityDb, UserStorage.rootCollection, uid)

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
      app_ids: arrayRemove(appId) as unknown as string[],
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
