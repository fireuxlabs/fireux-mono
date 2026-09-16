import { readKitchenAccessIds } from '../../utils/kitchen-access'
// Concurrent edit — 2026-07-21 16:57 CEST — Kitchen Finance surface: require App membership plus Kitchen report authority.
// Concurrent edit — 2026-07-22 00:38 CEST — Dish image server: expose App-admin-or-Kitchen-operator write authority.
import { createError, type H3Event } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverKitchenAccessTarget } from './access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'

const linkedDocumentId = (value: unknown, label: string) => {
  const id = typeof value === 'string' ? value.trim() : ''
  if (!isFirestoreDocumentId(id)) {
    throw createError({
      statusCode: 409,
      statusMessage: `${label} is missing or invalid.`,
    })
  }
  return id
}

export async function requireKitchenOperator(
  event: H3Event,
  input: { appId: string; kitchenId: string },
  message = 'Kitchen operator access is required.'
) {
  const access = await requireKitchenWriter(event, input, message)
  return access.uid
}

export async function requireKitchenReportReader(
  event: H3Event,
  input: { appId: string; kitchenId: string }
) {
  const access = await requireKitchenWriter(
    event,
    input,
    'Sign in to view Kitchen finance.'
  )
  const placeId = linkedDocumentId(input.kitchenId, 'Kitchen id')
  const rootPlaceSnapshot = await access.db
    .collection('places')
    .doc(placeId)
    .get()
  if (!rootPlaceSnapshot.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The Kitchen linked Place does not exist.',
    })
  }

  return {
    ...access,
    rootPlace: rootPlaceSnapshot.data() ?? {},
  }
}

export async function requireKitchenWriter(
  event: H3Event,
  input: { appId: string; kitchenId: string },
  signInMessage = 'Sign in to manage this Kitchen.'
) {
  const user = await requireFirebaseBearerUser(event, signInMessage)
  return requireKitchenWriterAccount(input, user.uid)
}

export async function requireKitchenWriterAccount(
  input: { appId: string; kitchenId: string },
  uid: string,
  mutations?: GuardedServerTransaction
) {
  const db = getRuntimeFirestore()
  const targets = [
    [serverAppUsersTarget(input.appId), uid],
    [FIRESTORE_MUTATION_TARGETS.kitchens, input.kitchenId],
    [serverKitchenAccessTarget(input.appId), uid],
  ] as const
  const [membershipSnapshot, rootKitchenSnapshot, accessSnapshot] = mutations
    ? await Promise.all(
        targets.map(([target, id]) => mutations.read(target, id))
      )
    : (
        await db.getAll(
          ...targets.map(([target, id]) =>
            db.collection(target.collectionPath).doc(id)
          )
        )
      ).map((snapshot) => ({ exists: snapshot.exists, data: snapshot.data() }))
  const role = String(membershipSnapshot!.data?.role ?? '').trim()
  if (
    !membershipSnapshot!.exists ||
    (role !== 'admin' && role !== 'user' && role !== 'dev')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Active App membership is required.',
    })
  }
  if (!rootKitchenSnapshot!.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'The Kitchen does not exist.',
    })
  }
  if (
    !readKitchenAccessIds(
      accessSnapshot!.data,
      membershipSnapshot!.data
    ).includes(input.kitchenId)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Kitchen association is required.',
    })
  }

  return {
    db,
    uid,
    rootKitchen: rootKitchenSnapshot!.data ?? {},
  }
}
