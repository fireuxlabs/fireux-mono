// Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: require current legal evidence before trusted identity creation.
// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: provision only trusted HTTPS or ecosystem-default avatars.
// Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: provision the optional public biography field empty.

import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import {
  USER_ECOSYSTEM_AVATAR_SRC,
  UserStorage,
} from '../../../models/core/user.model'
import { UserAccountStorage } from '../../../models/operations/user-account.model'
import {
  type UserHandleReservationInput,
  type UserHandleReservationResult,
} from '../../../models/operations/user-handle-reservation'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../../models/operations/user-account-provisioning'
import { resolveUserAvatarSource } from '../../../utils/user-avatar.ts'
import { readHttpsUrl } from '../../../utils/httpsUrl'
import { validatePublicSlug } from '../../../utils/slug/validatePublicSlug'
import { getRuntimeIdentityFirestore } from '../getRuntimeFirestore'

const USER_HANDLE_RESERVATION_COLLECTION = 'user-handles'
const USER_HANDLE_STATE_COLLECTION = 'user-handle-state'
const USER_HANDLE_STATE_DOCUMENT = 'canonical'

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function runtimeReservedHandleKeys() {
  const runtime = useRuntimeConfig()
  const keys = (runtime.public?.fireux as Record<string, unknown> | undefined)
    ?.reservedRouteKeys
  return Array.isArray(keys) ? keys : []
}

function requireHandle(value: unknown) {
  const validation = validatePublicSlug(value, {
    required: true,
    minLength: 3,
    maxLength: 30,
    label: 'Handle',
    reservedScope: 'root',
    registeredReserved: runtimeReservedHandleKeys(),
  })
  if (!validation.isValid) fail(400, validation.message || 'Invalid handle.')
  return validation.slug
}

function normalizeCreation(value: UserHandleReservationInput['create']) {
  if (!value || typeof value !== 'object') return null

  const displayName = String(value.display_name || '').trim()
  if (!displayName || displayName.length > 120) {
    fail(400, 'A display name between 1 and 120 characters is required.')
  }

  const requestedAvatar = String(value.avatar ?? '').trim()
  if (
    requestedAvatar &&
    requestedAvatar !== USER_ECOSYSTEM_AVATAR_SRC &&
    !readHttpsUrl(requestedAvatar)
  ) {
    fail(400, 'Avatar must be a valid HTTPS URL.')
  }
  const avatar = resolveUserAvatarSource(requestedAvatar)

  return { displayName, avatar }
}

function isCurrentTermsAccount(snapshot: FirebaseFirestore.DocumentSnapshot) {
  const terms = snapshot.get('terms') as Record<string, unknown> | undefined
  return (
    snapshot.exists &&
    terms?.version === FIREUX_ACCOUNT_TERMS_VERSION &&
    terms.accepted_at != null
  )
}

function ownerUid(snapshot: FirebaseFirestore.DocumentSnapshot) {
  return String(snapshot.get('uid') || '').trim()
}

function canonicalExistingHandle(value: unknown) {
  const handle = String(value || '')
    .trim()
    .toLowerCase()
  return /^[a-z0-9][a-z0-9-]{2,29}$/.test(handle) ? handle : ''
}

export async function reserveUserHandle(input: {
  uid: string
  payload: UserHandleReservationInput
}): Promise<UserHandleReservationResult> {
  const uid = String(input.uid || '').trim()
  if (!uid) fail(400, 'User id is required.')

  const requestedHandle = requireHandle(input.payload?.handle)
  const creation = normalizeCreation(input.payload?.create)
  const db = getRuntimeIdentityFirestore()
  const users = db.collection(UserStorage.collection)
  const userRef = users.doc(uid)
  const existingUser = await userRef.get()
  const existingHandle = existingUser.exists
    ? canonicalExistingHandle(existingUser.get('handle'))
    : ''
  // Initial provisioning is idempotent: an existing identity keeps its canonical
  // handle and repairs its reservation instead of being renamed from Auth data.
  const handle = creation && existingHandle ? existingHandle : requestedHandle
  const reservationRef = db
    .collection(USER_HANDLE_RESERVATION_COLLECTION)
    .doc(handle)
  const stateRef = db
    .collection(USER_HANDLE_STATE_COLLECTION)
    .doc(USER_HANDLE_STATE_DOCUMENT)
  const accountRef = userRef
    .collection(UserAccountStorage.collection)
    .doc(UserAccountStorage.document)

  // Existing identities predate the reservation collection. Do not let a new
  // reservation steal one while the one-time backfill is still outstanding.
  const existing = await users.where('handle', '==', handle).limit(2).get()
  if (existing.docs.some((row) => row.id !== uid)) {
    fail(409, 'This handle is already in use.')
  }

  return db.runTransaction(async (transaction) => {
    const [userSnapshot, reservationSnapshot, accountSnapshot, stateSnapshot] =
      await transaction.getAll(userRef, reservationRef, accountRef, stateRef)
    if (
      !stateSnapshot.exists ||
      stateSnapshot.get('schema_version') !== 1 ||
      stateSnapshot.get('backfill_complete') !== true
    ) {
      fail(503, 'User handle provisioning is paused for canonical backfill.')
    }
    const reservationOwner = ownerUid(reservationSnapshot)

    if (reservationSnapshot.exists && reservationOwner !== uid) {
      fail(409, 'This handle is already in use.')
    }

    const storedHandle = userSnapshot.exists
      ? String(userSnapshot.get('handle') || '').trim()
      : ''
    const currentHandle = canonicalExistingHandle(storedHandle)
    if (creation && currentHandle && currentHandle !== handle) {
      fail(
        409,
        'The user identity changed while handle provisioning was in progress.'
      )
    }
    const oldReservationRef =
      currentHandle && currentHandle !== handle
        ? db.collection(USER_HANDLE_RESERVATION_COLLECTION).doc(currentHandle)
        : null
    const oldReservationSnapshot = oldReservationRef
      ? await transaction.get(oldReservationRef)
      : null

    let repaired = false
    if (!reservationSnapshot.exists) {
      transaction.create(reservationRef, {
        uid,
        handle,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      })
      repaired = userSnapshot.exists && currentHandle === handle
    }

    if (!userSnapshot.exists) {
      if (!creation) fail(409, 'Public identity provisioning is required.')
      if (!isCurrentTermsAccount(accountSnapshot)) {
        fail(
          409,
          'Accept the current Terms of Service and acknowledge the Privacy Policy.'
        )
      }

      transaction.create(userRef, {
        display_name: creation.displayName,
        bio: '',
        avatar: creation.avatar,
        handle,
        app_ids: [],
        profiles: [],
        created: {
          at: FieldValue.serverTimestamp(),
          by: uid,
        },
        updated: {
          at: FieldValue.serverTimestamp(),
          by: uid,
        },
      })

      return { uid, handle, created: true, changed: true, repaired: false }
    }

    const changed = storedHandle !== handle
    if (changed) {
      transaction.update(userRef, {
        handle,
        updated: {
          at: FieldValue.serverTimestamp(),
          by: uid,
        },
      })
    }

    if (oldReservationRef && ownerUid(oldReservationSnapshot!) === uid) {
      transaction.delete(oldReservationRef)
    }

    return { uid, handle, created: false, changed, repaired }
  })
}
