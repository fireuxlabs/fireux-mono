// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: expose authenticated reservation and canonical identity provisioning.

import { createError, defineEventHandler, readBody } from 'h3'
import type { UserHandleInput } from '../../../../user/models/user-handle'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { updateUserHandle } from '../../../../user/server/user-handle/update'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const body = await readBody<UserHandleInput>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A handle is required.',
    })
  }

  try {
    return await updateUserHandle({ uid, payload: body })
  } catch (error) {
    console.error('[User identity provisioning] failed', { uid, error })
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? Number(error.statusCode)
        : 0
    if (statusCode >= 400 && statusCode < 500) throw error
    if (import.meta.dev && error instanceof Error && error.message.trim()) {
      throw createError({
        statusCode: 500,
        statusMessage: `Public identity could not be created: ${error.message.trim()}`,
      })
    }
    throw error
  }
})
