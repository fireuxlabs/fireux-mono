// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: expose authenticated reservation and canonical identity provisioning.

import { createError, defineEventHandler, readBody } from 'h3'
import type { UserHandleReservationInput } from '../../../../models/core/supporting/user-handle-reservation'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { reserveUserHandle } from '../../../utils/user-handle/reserve'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = await readBody<UserHandleReservationInput>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A handle is required.',
    })
  }

  return reserveUserHandle({ uid, payload: body })
})
