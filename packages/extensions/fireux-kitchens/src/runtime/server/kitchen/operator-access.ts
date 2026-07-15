import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

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
