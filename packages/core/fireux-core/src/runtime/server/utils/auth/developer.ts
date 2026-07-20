// Concurrent edit — 2026-07-20 16:15 CEST — Repo Efficiency Pass 1 of 6: centralize dev-only developer authentication.

import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from './bearer'

/** Require both a development build and the runtime's exact developer User. */
export async function requireDevDeveloper(event: H3Event) {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig(event)
  const developerId = String(runtime.public?.fireux?.developerId ?? '').trim()

  if (!developerId) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Developer access is not configured.',
    })
  }
  if (uid !== developerId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Developer access is required.',
    })
  }

  return { uid }
}
