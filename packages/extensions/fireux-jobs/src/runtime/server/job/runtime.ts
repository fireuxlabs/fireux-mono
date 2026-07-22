// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: resolve immutable App, database, category, and workplace authority from runtime config.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: keep only category as an App-configured Job delta.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'

export type JobServerScope = {
  appId: string
  ecosystemId: string
  databaseId: string
  identityDatabaseId: string
  categories: ReadonlySet<string>
  profiles: ReadonlySet<string>
}

const text = (value: unknown) => String(value ?? '').trim()

function identifiers(value: unknown): ReadonlySet<string> {
  return new Set(
    Array.isArray(value)
      ? value.map(text).filter(Boolean)
      : []
  )
}

export function readJobServerScope(event: H3Event): JobServerScope {
  const runtime = useRuntimeConfig(event)
  const fireux = (runtime.public?.fireux ?? {}) as Record<string, unknown>
  const firebase = (runtime.public?.firebaseEcosystem?.firebase ?? {}) as Record<
    string,
    unknown
  >
  const jobs = (fireux.jobs ?? {}) as Record<string, unknown>
  const appId = requireFirestoreDocumentId(fireux.id, 'Runtime App id')
  const databaseId = text(firebase.databaseId)
  const identityDatabaseId = text(firebase.identityDatabaseId) || databaseId

  if (!databaseId || !identityDatabaseId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The runtime App database identity is not configured.',
    })
  }

  return {
    appId,
    ecosystemId: text(fireux.ecosystemId),
    databaseId,
    identityDatabaseId,
    categories: identifiers(jobs.categories),
    profiles: identifiers(fireux.profiles),
  }
}
