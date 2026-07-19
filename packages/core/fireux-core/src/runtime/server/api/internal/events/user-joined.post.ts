import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler } from 'h3'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { publishAppUserJoinedEvent } from '../../../utils/events/publishAppUserJoinedEvent'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const appId = String(runtime.public?.fireux?.id || '').trim()
  const ecosystemId = String(runtime.public?.fireux?.ecosystem || '').trim()

  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The runtime app identity is not configured.',
    })
  }

  try {
    const result = await publishAppUserJoinedEvent({
      appId,
      ecosystemId,
      userId: uid,
    })

    return {
      ok: true,
      event: {
        id: result.eventId,
        name: 'app.user.joined' as const,
        created: result.created,
      },
    }
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'The user event could not be published.',
    })
  }
})
