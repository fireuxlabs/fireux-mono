// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: make App membership, role, premium, and console-target writes server-owned.
// Concurrent edit — 2026-07-20 14:10 CEST — Membership revocation pass: clear retained target and Driver grants so re-approval cannot resurrect authority.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: remove the parallel profile-index mutation route.

import { createError } from 'h3'
import {
  FieldValue,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore'
import { AppStorage } from '../../../models/core/app.model'
import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
  AppMembershipRole,
} from '../../../models/core/supporting/app-membership'
import {
  AppJoinRequestStorage,
  AppMembershipBlockStorage,
} from '../../../models/core/supporting/app-membership'
import {
  UserAppConsoleTargetsModel,
  UserAppStorage,
  UserStorage,
  resolveUserAppConsoleTargetField,
} from '../../../models/core/user.model'
import { requireFirestoreDocumentId } from '../ids/path'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../getRuntimeFirestore'

type MutationContext = {
  actorUid: string
  appId: string
  developerUid: string
  appDatabaseId: string
  identityDatabaseId: string
  input: AppMembershipMutationInput
}

type MirrorMode = 'add' | 'remove' | null

type TransactionOutcome = AppMembershipMutationResult & {
  identityMirror: MirrorMode
}

const CONSOLE_COLLECTION_BY_FAMILY: Record<string, string> = {
  blank: 'blanks',
  kitchen: 'kitchens',
  portfolio: 'portfolios',
  property: 'properties',
  supplier: 'suppliers',
}

const MAX_TARGET_AUTHORITY_REVOCATIONS = 400

function forbidden(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function stringList(value: unknown, max = 500) {
  if (!Array.isArray(value)) return []
  const values = value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry) => entry && !entry.includes('/'))
    .slice(0, max)
  return [...new Set(values)]
}

function membershipCount(data: DocumentData) {
  const count = Number(data?.derived?.user_count)
  return Number.isSafeInteger(count) && count >= 0 ? count : 0
}

function stamp(actorUid: string) {
  return {
    at: FieldValue.serverTimestamp(),
    by: actorUid,
  }
}

function initialMembership(
  appId: string,
  actorUid: string,
  role: AppMembershipRole
) {
  return {
    role,
    is_premium: false,
    console_enabled: role === 'admin',
    profiles: [],
    console_targets: Object.fromEntries(
      Object.entries(UserAppConsoleTargetsModel).map(([key]) => [key, []])
    ),
    created: {
      at: FieldValue.serverTimestamp(),
      by: actorUid,
      app_id: appId,
    },
    updated: stamp(actorUid),
  }
}

function membershipRepairPatch(data: DocumentData, actorUid: string) {
  const patch: Record<string, unknown> = {}
  if (typeof data.is_premium !== 'boolean') patch.is_premium = false
  if (typeof data.console_enabled !== 'boolean') patch.console_enabled = false
  if (!Array.isArray(data.profiles)) patch.profiles = []
  if ('notifications' in data) patch.notifications = FieldValue.delete()

  const currentTargets =
    data.console_targets &&
    typeof data.console_targets === 'object' &&
    !Array.isArray(data.console_targets)
      ? data.console_targets as Record<string, unknown>
      : {}
  const repairedTargets = Object.fromEntries(
    Object.entries(UserAppConsoleTargetsModel).map(([key]) => [
      key,
      stringList(currentTargets[key], 50),
    ])
  )
  const targetsNeedRepair = Object.keys(UserAppConsoleTargetsModel).some(
    (key) => !Array.isArray(currentTargets[key])
  )
  if (targetsNeedRepair) {
    patch.console_targets = {
      ...currentTargets,
      ...repairedTargets,
    }
  }

  if (Object.keys(patch).length) patch.updated = stamp(actorUid)
  return patch
}

function roleFrom(data: DocumentData | undefined): AppMembershipRole | null {
  return data?.role === 'admin' || data?.role === 'user' ? data.role : null
}

function isAdminMembership(data: DocumentData | undefined) {
  return roleFrom(data) === 'admin'
}

function requireAdmin(data: DocumentData | undefined) {
  if (!isAdminMembership(data)) {
    forbidden(403, 'App admin access is required.')
  }
}

function requiredIdentityUserId(
  input: AppMembershipMutationInput,
  actorUid: string
) {
  if (
    input.action === 'ensure-self' ||
    input.action === 'bootstrap-admin' ||
    input.action === 'set-console-target'
  ) {
    return actorUid
  }
  if (input.action === 'review-join' && input.approve) {
    return requireFirestoreDocumentId(input.userId, 'User id')
  }
  return ''
}

async function requireIdentityUser(
  transaction: Transaction,
  userRef: DocumentReference,
  alreadyVerified: boolean
) {
  if (alreadyVerified) return
  const snapshot = await transaction.get(userRef)
  if (!snapshot.exists) {
    forbidden(409, 'The public User record does not exist.')
  }
}

function updateIdentityMirror(
  transaction: Transaction,
  userRef: DocumentReference,
  appId: string,
  actorUid: string,
  mode: Exclude<MirrorMode, null>
) {
  transaction.set(
    userRef,
    {
      app_ids:
        mode === 'add'
          ? FieldValue.arrayUnion(appId)
          : FieldValue.arrayRemove(appId),
      updated: stamp(actorUid),
    },
    { merge: true }
  )
}

function appGovernancePatch(
  appData: DocumentData,
  actorUid: string,
  options: {
    countDelta?: number
  }
) {
  const patch: Record<string, unknown> = {
    updated: stamp(actorUid),
  }

  if (options.countDelta) {
    patch['derived.user_count'] = Math.max(
      0,
      membershipCount(appData) + options.countDelta
    )
  }

  return patch
}

async function countTransactionAdmins(
  transaction: Transaction,
  appRef: DocumentReference
) {
  const snapshot = await transaction.get(
    appRef.collection(UserAppStorage.collection).where('role', '==', 'admin').limit(2)
  )
  return snapshot.size
}

function normalizedConsoleTargets(data: DocumentData) {
  const source =
    data.console_targets &&
    typeof data.console_targets === 'object' &&
    !Array.isArray(data.console_targets)
      ? data.console_targets as Record<string, unknown>
      : {}

  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => /^[a-z][a-z0-9_]{0,63}$/.test(key))
      .map(([key, value]) => [key, stringList(value, 50)])
  ) as Record<string, string[]>
}

async function readTargetAuthorityRevocations(
  transaction: Transaction,
  appRef: DocumentReference,
  userId: string
) {
  const refs = new Map<string, DocumentReference>()
  const targetCollections = [...new Set(Object.values(CONSOLE_COLLECTION_BY_FAMILY))]

  for (const collectionName of targetCollections) {
    for (const field of ['operator_ids', 'team_ids']) {
      const snapshot = await transaction.get(
        appRef
          .collection(collectionName)
          .where(field, 'array-contains', userId)
          .limit(MAX_TARGET_AUTHORITY_REVOCATIONS + 1)
      )
      for (const document of snapshot.docs) refs.set(document.ref.path, document.ref)
      if (refs.size > MAX_TARGET_AUTHORITY_REVOCATIONS) {
        forbidden(
          409,
          'This member has too many retained target grants for an online removal.'
        )
      }
    }
  }

  return [...refs.values()]
}

function revokedDriverLinks(data: DocumentData) {
  if (!Array.isArray(data.kitchen_links)) return []
  return data.kitchen_links
    .slice(0, 50)
    .flatMap((value: unknown) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return []
      return [{ ...(value as Record<string, unknown>), active: false }]
    })
}

async function mutateInTransaction(
  context: MutationContext,
  appDb: Firestore,
  identityDb: Firestore,
  sameDatabase: boolean,
  crossDatabaseUserVerified: boolean
): Promise<TransactionOutcome> {
  const { actorUid, appId, developerUid, input } = context
  const appRef = appDb.collection(AppStorage.collection).doc(appId)
  const membershipCollection = appRef.collection(UserAppStorage.collection)

  return appDb.runTransaction(async (transaction) => {
    const appSnapshot = await transaction.get(appRef)
    if (!appSnapshot.exists) {
      forbidden(409, 'The runtime App record does not exist.')
    }
    const appData = appSnapshot.data() ?? {}
    const actorMembershipRef = membershipCollection.doc(actorUid)
    const actorJoinRequestRef = appRef
      .collection(AppJoinRequestStorage.collection)
      .doc(actorUid)
    const actorMembershipBlockRef = appRef
      .collection(AppMembershipBlockStorage.collection)
      .doc(actorUid)
    const actorMembershipSnapshot = await transaction.get(actorMembershipRef)
    const actorMembership = actorMembershipSnapshot.data()

    if (input.action === 'ensure-self') {
      const userRef = (sameDatabase ? appDb : identityDb)
        .collection(UserStorage.rootCollection)
        .doc(actorUid)
      await requireIdentityUser(
        transaction,
        userRef,
        crossDatabaseUserVerified
      )

      const created = !actorMembershipSnapshot.exists
      if (created) {
        const blockSnapshot = await transaction.get(actorMembershipBlockRef)
        if (blockSnapshot.exists) {
          forbidden(403, 'This App membership has been blocked.')
        }
        if (appData.self_join_enabled !== true) {
          forbidden(403, 'This App requires an approved join request.')
        }
        transaction.create(
          actorMembershipRef,
          initialMembership(appId, actorUid, 'user')
        )
        transaction.update(
          appRef,
          appGovernancePatch(appData, actorUid, { countDelta: 1 })
        )
      } else {
        if (!roleFrom(actorMembership)) {
          forbidden(409, 'The existing App membership has an invalid role.')
        }
        const repair = membershipRepairPatch(actorMembership ?? {}, actorUid)
        if (Object.keys(repair).length) {
          transaction.update(actorMembershipRef, repair)
        }
      }

      if (sameDatabase) {
        updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
      }

      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created,
        role: created ? 'user' : roleFrom(actorMembership) ?? 'user',
        identityMirror: sameDatabase ? null : 'add',
      }
    }

    if (input.action === 'bootstrap-admin') {
      if (!developerUid || actorUid !== developerUid) {
        forbidden(403, 'Only the configured developer can bootstrap this App.')
      }
      const userRef = (sameDatabase ? appDb : identityDb)
        .collection(UserStorage.rootCollection)
        .doc(actorUid)
      await requireIdentityUser(
        transaction,
        userRef,
        crossDatabaseUserVerified
      )

      const actorIsAdmin = isAdminMembership(actorMembership)
      if (!actorIsAdmin && (await countTransactionAdmins(transaction, appRef)) > 0) {
        forbidden(409, 'This App already has an administrator.')
      }

      const created = !actorMembershipSnapshot.exists
      if (created) {
        transaction.create(
          actorMembershipRef,
          initialMembership(appId, actorUid, 'admin')
        )
      } else {
        transaction.update(actorMembershipRef, {
          ...membershipRepairPatch(actorMembership ?? {}, actorUid),
          role: 'admin',
          console_enabled: true,
          updated: stamp(actorUid),
        })
      }
      transaction.update(
        appRef,
        appGovernancePatch(appData, actorUid, {
          countDelta: created ? 1 : 0,
        })
      )
      if (sameDatabase) {
        updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
      }

      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created,
        role: 'admin',
        identityMirror: sameDatabase ? null : 'add',
      }
    }

    if (input.action === 'request-join') {
      if (actorMembershipSnapshot.exists) {
        return {
          ok: true,
          action: input.action,
          appId,
          userId: actorUid,
          requested: false,
          identityMirror: null,
        }
      }

      const blockSnapshot = await transaction.get(actorMembershipBlockRef)
      if (blockSnapshot.exists) {
        forbidden(403, 'This App membership has been blocked.')
      }

      transaction.set(actorJoinRequestRef, {
        user_id: actorUid,
        created: {
          at: FieldValue.serverTimestamp(),
          by: actorUid,
          app_id: appId,
        },
      })
      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        requested: true,
        identityMirror: null,
      }
    }

    if (input.action === 'review-join') {
      requireAdmin(actorMembership)
      const userId = requireFirestoreDocumentId(input.userId, 'User id')
      const targetMembershipRef = membershipCollection.doc(userId)
      const targetJoinRequestRef = appRef
        .collection(AppJoinRequestStorage.collection)
        .doc(userId)
      const targetMembershipBlockRef = appRef
        .collection(AppMembershipBlockStorage.collection)
        .doc(userId)
      const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
      let created = false
      let mirror: MirrorMode = null

      if (input.approve) {
        const userRef = (sameDatabase ? appDb : identityDb)
          .collection(UserStorage.rootCollection)
          .doc(userId)
        await requireIdentityUser(
          transaction,
          userRef,
          crossDatabaseUserVerified
        )
        created = !targetMembershipSnapshot.exists
        if (created) {
          transaction.create(
            targetMembershipRef,
            initialMembership(appId, actorUid, 'user')
          )
        }
        if (sameDatabase) {
          updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
        } else {
          mirror = 'add'
        }
        transaction.delete(targetMembershipBlockRef)
      }

      transaction.update(
        appRef,
        appGovernancePatch(appData, actorUid, {
          countDelta: created ? 1 : 0,
        })
      )
      transaction.delete(targetJoinRequestRef)
      return {
        ok: true,
        action: input.action,
        appId,
        userId,
        created,
        role: input.approve ? roleFrom(targetMembershipSnapshot.data()) ?? 'user' : undefined,
        identityMirror: mirror,
      }
    }

    if (input.action === 'set-role') {
      requireAdmin(actorMembership)
      const userId = requireFirestoreDocumentId(input.userId, 'User id')
      const role: AppMembershipRole =
        input.role === 'admin' || input.role === 'user'
          ? input.role
          : forbidden(400, 'Role must be admin or user.')
      const targetMembershipRef = membershipCollection.doc(userId)
      const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
      if (!targetMembershipSnapshot.exists) {
        forbidden(404, 'The target App membership does not exist.')
      }
      const previousRole = roleFrom(targetMembershipSnapshot.data())
      if (!previousRole) {
        forbidden(409, 'The target App membership has an invalid role.')
      }
      if (
        previousRole === 'admin' &&
        role === 'user' &&
        (await countTransactionAdmins(transaction, appRef)) <= 1
      ) {
        forbidden(409, 'The final App administrator cannot be demoted.')
      }

      transaction.update(targetMembershipRef, {
        role,
        ...(role === 'admin' ? { console_enabled: true } : {}),
        updated: stamp(actorUid),
      })
      return {
        ok: true,
        action: input.action,
        appId,
        userId,
        role,
        identityMirror: null,
      }
    }

    if (input.action === 'set-premium') {
      requireAdmin(actorMembership)
      const userId = requireFirestoreDocumentId(input.userId, 'User id')
      if (typeof input.isPremium !== 'boolean') {
        forbidden(400, 'Premium state must be boolean.')
      }
      const targetMembershipRef = membershipCollection.doc(userId)
      const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
      if (!targetMembershipSnapshot.exists) {
        forbidden(404, 'The target App membership does not exist.')
      }
      transaction.update(targetMembershipRef, {
        is_premium: input.isPremium,
        updated: stamp(actorUid),
      })
      return {
        ok: true,
        action: input.action,
        appId,
        userId,
        isPremium: input.isPremium,
        identityMirror: null,
      }
    }

    if (input.action === 'remove-member') {
      const userId = requireFirestoreDocumentId(
        input.userId || actorUid,
        'User id'
      )
      if (userId !== actorUid) requireAdmin(actorMembership)
      const targetMembershipRef = membershipCollection.doc(userId)
      const targetMembershipSnapshot =
        userId === actorUid
          ? actorMembershipSnapshot
          : await transaction.get(targetMembershipRef)
      const targetMembership = targetMembershipSnapshot.data()
      if (!targetMembershipSnapshot.exists) {
        const userRef = (sameDatabase ? appDb : identityDb)
          .collection(UserStorage.rootCollection)
          .doc(userId)
        const driverRef = appRef.collection('drivers').doc(userId)
        const targetAuthorityRefs = await readTargetAuthorityRevocations(
          transaction,
          appRef,
          userId
        )
        const driverSnapshot = await transaction.get(driverRef)
        if (sameDatabase) {
          const userSnapshot = await transaction.get(userRef)
          if (userSnapshot.exists) {
            updateIdentityMirror(transaction, userRef, appId, actorUid, 'remove')
          }
        }
        transaction.delete(
          appRef.collection(AppJoinRequestStorage.collection).doc(userId)
        )
        for (const targetRef of targetAuthorityRefs) {
          transaction.update(targetRef, {
            operator_ids: FieldValue.arrayRemove(userId),
            team_ids: FieldValue.arrayRemove(userId),
            updated: stamp(actorUid),
          })
        }
        if (driverSnapshot.exists) {
          transaction.update(driverRef, {
            active_kitchen_ids: [],
            kitchen_links: revokedDriverLinks(driverSnapshot.data() ?? {}),
            updated: stamp(actorUid),
          })
        }
        if (userId !== actorUid) {
          transaction.set(
            appRef.collection(AppMembershipBlockStorage.collection).doc(userId),
            {
              user_id: userId,
              blocked: stamp(actorUid),
            }
          )
        }
        return {
          ok: true,
          action: input.action,
          appId,
          userId,
          removed: false,
          identityMirror: sameDatabase ? null : 'remove',
        }
      }
      if (
        isAdminMembership(targetMembership) &&
        (await countTransactionAdmins(transaction, appRef)) <= 1
      ) {
        forbidden(409, 'The final App administrator cannot leave or be removed.')
      }

      const userRef = (sameDatabase ? appDb : identityDb)
        .collection(UserStorage.rootCollection)
        .doc(userId)
      const driverRef = appRef.collection('drivers').doc(userId)
      const [targetAuthorityRefs, driverSnapshot] = await Promise.all([
        readTargetAuthorityRevocations(transaction, appRef, userId),
        transaction.get(driverRef),
      ])
      if (sameDatabase) {
        const userSnapshot = await transaction.get(userRef)
        if (userSnapshot.exists) {
          updateIdentityMirror(transaction, userRef, appId, actorUid, 'remove')
        }
      }
      transaction.delete(targetMembershipRef)
      transaction.delete(
        appRef.collection(AppJoinRequestStorage.collection).doc(userId)
      )
      for (const targetRef of targetAuthorityRefs) {
        transaction.update(targetRef, {
          operator_ids: FieldValue.arrayRemove(userId),
          team_ids: FieldValue.arrayRemove(userId),
          updated: stamp(actorUid),
        })
      }
      if (driverSnapshot.exists) {
        transaction.update(driverRef, {
          active_kitchen_ids: [],
          kitchen_links: revokedDriverLinks(driverSnapshot.data() ?? {}),
          updated: stamp(actorUid),
        })
      }
      if (userId !== actorUid) {
        transaction.set(
          appRef.collection(AppMembershipBlockStorage.collection).doc(userId),
          {
            user_id: userId,
            blocked: stamp(actorUid),
          }
        )
      }
      transaction.update(
        appRef,
        appGovernancePatch(appData, actorUid, {
          countDelta: -1,
        })
      )
      return {
        ok: true,
        action: input.action,
        appId,
        userId,
        removed: true,
        identityMirror: sameDatabase ? null : 'remove',
      }
    }

    if (input.action === 'set-console-target') {
      const family = String(input.family ?? '').trim().toLowerCase()
      const targetField = resolveUserAppConsoleTargetField(family)
      const targetCollection = CONSOLE_COLLECTION_BY_FAMILY[family]
      if (!targetField || !targetCollection) {
        forbidden(400, 'Console family is not supported.')
      }
      if (typeof input.enabled !== 'boolean') {
        forbidden(400, 'Console target state must be boolean.')
      }
      const targetId = requireFirestoreDocumentId(input.targetId, 'Console target id')
      const targetRef = appRef.collection(targetCollection).doc(targetId)
      const targetSnapshot = await transaction.get(targetRef)
      if (!targetSnapshot.exists) {
        forbidden(404, 'The console target does not exist in this App.')
      }
      const targetData = targetSnapshot.data() ?? {}
      const operatorIds = new Set([
        ...stringList(targetData.operator_ids),
        ...stringList(targetData.team_ids),
      ])
      if (!operatorIds.has(actorUid)) {
        forbidden(403, 'You are not an operator of this console target.')
      }

      const userRef = (sameDatabase ? appDb : identityDb)
        .collection(UserStorage.rootCollection)
        .doc(actorUid)
      await requireIdentityUser(
        transaction,
        userRef,
        crossDatabaseUserVerified
      )
      const created = !actorMembershipSnapshot.exists
      const membership = actorMembership ?? {}
      const targets = normalizedConsoleTargets(membership)
      const current = stringList(targets[targetField], 50)
      const next = input.enabled
        ? [...new Set([...current, targetId])]
        : current.filter((id) => id !== targetId)
      if (next.length > 50) {
        forbidden(409, 'This console target list is full.')
      }
      targets[targetField] = next
      const hasTargets = Object.values(targets).some((ids) => ids.length > 0)

      if (created) {
        const blockSnapshot = await transaction.get(actorMembershipBlockRef)
        if (blockSnapshot.exists) {
          forbidden(403, 'This App membership has been blocked.')
        }
        transaction.create(actorMembershipRef, {
          ...initialMembership(appId, actorUid, 'user'),
          console_enabled: hasTargets,
          console_targets: {
            ...Object.fromEntries(
              Object.entries(UserAppConsoleTargetsModel).map(([key]) => [key, []])
            ),
            ...targets,
          },
        })
        transaction.update(
          appRef,
          appGovernancePatch(appData, actorUid, { countDelta: 1 })
        )
      } else {
        if (!roleFrom(membership)) {
          forbidden(409, 'The existing App membership has an invalid role.')
        }
        transaction.update(actorMembershipRef, {
          console_enabled: isAdminMembership(membership) || hasTargets,
          console_targets: targets,
          updated: stamp(actorUid),
        })
      }
      if (sameDatabase) {
        updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
      }

      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created,
        role: roleFrom(membership) ?? 'user',
        identityMirror: sameDatabase ? null : 'add',
      }
    }

    forbidden(400, 'Unsupported App membership action.')
  })
}

export async function mutateRuntimeAppMembership(
  context: MutationContext
): Promise<AppMembershipMutationResult> {
  const appDb = getRuntimeFirestore(context.appDatabaseId)
  const identityDb = getRuntimeIdentityFirestore(context.identityDatabaseId)
  const sameDatabase =
    String(context.appDatabaseId || '').trim() ===
    String(context.identityDatabaseId || context.appDatabaseId || '').trim()
  const requiredUserId = requiredIdentityUserId(context.input, context.actorUid)
  let crossDatabaseUserVerified = false

  if (!sameDatabase && requiredUserId) {
    const snapshot = await identityDb
      .collection(UserStorage.rootCollection)
      .doc(requiredUserId)
      .get()
    if (!snapshot.exists) {
      forbidden(409, 'The public User record does not exist.')
    }
    crossDatabaseUserVerified = true
  }

  const outcome = await mutateInTransaction(
    context,
    appDb,
    identityDb,
    sameDatabase,
    crossDatabaseUserVerified
  )

  if (!sameDatabase && outcome.identityMirror) {
    const userRef = identityDb
      .collection(UserStorage.rootCollection)
      .doc(outcome.userId)
    const userSnapshot = await userRef.get()
    if (userSnapshot.exists) {
      await userRef.set(
        {
          app_ids:
            outcome.identityMirror === 'add'
              ? FieldValue.arrayUnion(context.appId)
              : FieldValue.arrayRemove(context.appId),
          updated: stamp(context.actorUid),
        },
        { merge: true }
      )
    }
  }

  const { identityMirror: _identityMirror, ...result } = outcome
  return result
}
