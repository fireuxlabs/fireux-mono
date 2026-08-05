// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: expose authenticated reservation and canonical identity provisioning.

import { createError, defineEventHandler, readBody } from 'h3'
import type { UserHandleInput } from '../../../../models/operations/user-handle'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { updateUserHandle } from '../../../utils/user-handle/update'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = await readBody<UserHandleInput>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A handle is required.',
    })
  }

  return updateUserHandle({ uid, payload: body })
})
