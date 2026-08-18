// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: expose runtime-scoped membership mutations behind verified Firebase Auth.

import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, readBody } from 'h3'
import type { AppMembershipMutationInput } from '../../../../app/models/app-membership'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import { mutateRuntimeAppMembership } from '../../../../app/server/app-membership/mutate'

export default defineEventHandler(async (event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const fireux = runtime.public?.fireux as Record<string, unknown> | undefined
  const firebase = runtime.public?.firebaseEcosystem?.firebase as
    | Record<string, unknown>
    | undefined
  const appId = String(fireux?.id || '').trim()
  const appDatabaseId = String(firebase?.databaseId || '').trim()
  const identityDatabaseId = String(
    firebase?.identityDatabaseId || appDatabaseId
  ).trim()
  const developerUid = String(fireux?.developerId || '').trim()
  const body = await readBody(event)

  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The runtime App identity is not configured.',
    })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A membership action is required.',
    })
  }

  return mutateRuntimeAppMembership({
    actorUid: uid,
    appId,
    developerUid,
    appDatabaseId,
    identityDatabaseId,
    input: body as AppMembershipMutationInput,
  })
})
