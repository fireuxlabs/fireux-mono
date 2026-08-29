import { createError, defineEventHandler, readBody } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requestPrimaryKitchenChange } from '../../../../kitchen/server/core/primary-kitchen'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to request a primary Kitchen change.'
  )
  const body = await readBody<{ kitchenId?: unknown }>(event)
  const kitchenId = String(body?.kitchenId || '').trim()
  if (!kitchenId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a Kitchen.',
    })
  }
  return requestPrimaryKitchenChange({
    appId: useFireUXConfig(event).appId,
    requestedKitchenId: kitchenId,
    uid,
  })
})
