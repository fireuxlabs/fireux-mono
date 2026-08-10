// User identity and its public handle have one canonical root: users/{uid}.

import { useRuntimeConfig } from '#imports'
import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../../models/core/user.model'
import { UserAccountStorage } from '../../../models/operations/user-account.model'
import {
  type UserHandleInput,
  type UserHandleResult,
} from '../../../models/operations/user-handle'
import { FIREUX_ACCOUNT_TERMS_VERSION } from '../../../models/operations/user-account-provisioning'
import { resolveUserAvatarSource } from '../../../utils/user-avatar.ts'
import { readHttpsUrl } from '../../../utils/httpsUrl'
import { validatePublicSlug } from '../../../utils/slug/validatePublicSlug'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverUserAccountTarget,
} from '../../../utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from '../firestore-mutations/server-transaction'

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

function normalizeCreation(value: UserHandleInput['create']) {
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

function isCurrentTermsAccount(snapshot: {
  exists: boolean
  data: Record<string, unknown> | undefined
}) {
  const terms = snapshot.data?.terms as Record<string, unknown> | undefined
  return (
    snapshot.exists &&
    terms?.version === FIREUX_ACCOUNT_TERMS_VERSION &&
    terms.accepted_at != null
  )
}

function canonicalExistingHandle(value: unknown) {
  const handle = String(value || '')
    .trim()
    .toLowerCase()
  return /^[a-z0-9][a-z0-9-]{2,29}$/.test(handle) ? handle : ''
}

export async function updateUserHandle(input: {
  uid: string
  payload: UserHandleInput
}): Promise<UserHandleResult> {
  const uid = String(input.uid || '').trim()
  if (!uid) fail(400, 'User id is required.')

  const requestedHandle = requireHandle(input.payload?.handle)
  const creation = normalizeCreation(input.payload?.create)
  const users = FIRESTORE_MUTATION_TARGETS.users
  const accounts = serverUserAccountTarget(uid)

  return runGuardedServerTransaction(users.database, async (mutations) => {
    const [userSnapshot, accountSnapshot] = await Promise.all([
      mutations.read<Record<string, unknown>>(users, uid),
      mutations.read<Record<string, unknown>>(
        accounts,
        UserAccountStorage.document
      ),
    ])

    const storedHandle = userSnapshot.exists
      ? String(userSnapshot.data?.handle || '').trim()
      : ''
    const currentHandle = canonicalExistingHandle(storedHandle)
    // Initial provisioning is idempotent: an existing identity keeps its
    // canonical handle instead of being renamed from mutable Auth data.
    const handle = creation && currentHandle ? currentHandle : requestedHandle
    const conflicts = await mutations.query(users, {
      field: 'handle',
      op: '==',
      value: handle,
      limit: 2,
    })
    if (conflicts.some((row) => row.id !== uid)) {
      fail(409, 'This handle is already in use.')
    }

    if (creation && currentHandle && currentHandle !== handle) {
      fail(
        409,
        'The user identity changed while handle provisioning was in progress.'
      )
    }
    if (!userSnapshot.exists) {
      if (!creation) fail(409, 'Public identity provisioning is required.')
      if (!isCurrentTermsAccount(accountSnapshot)) {
        fail(
          409,
          'Accept the current Terms of Service and acknowledge the Privacy Policy.'
        )
      }

      mutations.create(users, uid, {
        display_name: creation.displayName,
        bio: '',
        assets: { avatar: creation.avatar },
        handle,
        created: {
          at: FieldValue.serverTimestamp(),
          by: uid,
        },
        updated: {
          at: FieldValue.serverTimestamp(),
          by: uid,
        },
      })

      return { uid, handle, created: true, changed: true }
    }

    const data = userSnapshot.data ?? {}
    const patch: Record<string, unknown> = {}
    if (storedHandle !== handle) patch.handle = handle
    if (creation) {
      if (typeof data.display_name !== 'string' || !data.display_name.trim()) {
        patch.display_name = creation.displayName
      }
      if (typeof data.bio !== 'string') patch.bio = ''
      const assets = data.assets as Record<string, unknown> | undefined
      if (!readHttpsUrl(assets?.avatar)) {
        patch['assets.avatar'] = creation.avatar
      }
      if ('displayName' in data) patch.displayName = FieldValue.delete()
      if ('id' in data) patch.id = FieldValue.delete()
    }
    const changed = Object.keys(patch).length > 0
    if (changed) {
      mutations.update(users, uid, {
        ...patch,
        updated: {
          at: FieldValue.serverTimestamp(),
          by: uid,
        },
      })
    }

    return { uid, handle, created: false, changed }
  })
}
