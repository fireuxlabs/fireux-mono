// Concurrent edit — 2026-07-21 16:57 CEST — Kitchen Finance surface: require App membership plus Kitchen report authority.
import { createError, type H3Event } from 'h3'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { KitchenStorage } from '../../models/kitchen.model.ts'

const ids = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => String(entry ?? '').trim()).filter(Boolean)
    : []

export async function requireKitchenOperator(
  event: H3Event,
  input: { appId: string; kitchenId: string },
  message = 'Kitchen operator access is required.'
) {
  const user = await requireFirebaseBearerUser(event, message)
  const snap = await getRuntimeFirestore()
    .doc(`apps/${input.appId}/kitchens/${input.kitchenId}`)
    .get()
  const data = snap.data() || {}
  if (!snap.exists || !ids(data.operator_ids).includes(user.uid)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Kitchen operator access is required.',
    })
  }

  return user.uid
}

export async function requireKitchenReportReader(
  event: H3Event,
  input: { appId: string; kitchenId: string }
) {
  const user = await requireFirebaseBearerUser(
    event,
    'Sign in to view Kitchen finance.'
  )
  const db = getRuntimeFirestore()
  const appRef = db.collection(AppStorage.collection).doc(input.appId)
  const membershipRef = appRef
    .collection(UserAppStorage.collection)
    .doc(user.uid)
  const kitchenRef = appRef
    .collection(KitchenStorage.scopeCollection)
    .doc(input.kitchenId)
  const [membershipSnapshot, kitchenSnapshot] = await db.getAll(
    membershipRef,
    kitchenRef
  )
  const role = String(membershipSnapshot.get('role') ?? '').trim()
  if (
    !membershipSnapshot.exists ||
    (role !== 'admin' && role !== 'user')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Active App membership is required.',
    })
  }
  if (!kitchenSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'The Kitchen does not exist in this App.',
    })
  }
  if (
    role !== 'admin' &&
    !ids(kitchenSnapshot.get('operator_ids')).includes(user.uid)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'App admin or Kitchen operator access is required.',
    })
  }

  return { db, uid: user.uid }
}
