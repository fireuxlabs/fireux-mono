import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler } from 'h3'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { publishAppUserJoinedEvent } from '../../../../app/server/app-user/publish-joined-event'
import { publishProjectUserJoinProjection } from '../../../../project/server/project-user-join/publish'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const appId = String(runtime.public?.fireux?.id || '').trim()
  const ecosystemId = String(runtime.public?.fireux?.ecosystemId || '').trim()
  const projectId = String(runtime.public?.fireux?.projectId || '').trim()
  const firebaseProjectId = String(
    runtime.public?.firebaseEcosystem?.firebase?.projectId || ''
  ).trim()
  const databaseId = String(
    runtime.public?.firebaseEcosystem?.firebase?.databaseId || ''
  ).trim()

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

    let monitor = 'disabled'
    try {
      monitor = await publishProjectUserJoinProjection({
        version: 1,
        event_id: result.eventId,
        source: {
          firebase_project_id: firebaseProjectId,
          database_id: databaseId,
          project_id: projectId,
          ecosystem_id: ecosystemId,
          app_id: appId,
        },
        user_id: uid,
        membership_role: result.membershipRole,
        occurred_at: result.occurredAt,
      })
    } catch (error) {
      console.warn('[user-joined] signup monitor delivery failed', {
        appId,
        eventId: result.eventId,
        error,
      })
    }

    return {
      ok: true,
      event: {
        id: result.eventId,
        name: 'app.user.joined',
        created: result.created,
      },
      monitor,
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
