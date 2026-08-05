// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.
import { useRuntimeConfig } from '#imports'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model'
import { AppUserStorage } from 'fireux-core/runtime/models/core/user.model'
import {
  ProjectStorage,
  type ProjectStatus,
} from 'fireux-core/runtime/models/system/project.model'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getFirestoreDb } from '../../../utils/firebase-admin'

const PROJECT_STATUSES = new Set<ProjectStatus>([
  'draft',
  'active',
  'paused',
  'archived',
])

const text = (value: unknown) => String(value ?? '').trim()
export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const appId = text(runtime.public?.fireux?.id)
  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The FireUX App identity is not configured.',
    })
  }

  const db = await getFirestoreDb()
  const appRef = db.collection(AppStorage.collection).doc(appId)
  const [appSnapshot, membershipSnapshot] = await Promise.all([
    appRef.get(),
    appRef.collection(AppUserStorage.collection).doc(uid).get(),
  ])
  const membership = (membershipSnapshot.data() || {}) as Record<string, unknown>
  const isAdmin = text(membership.role) === 'admin'

  if (!appSnapshot.exists || !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App admin access is required.',
    })
  }

  const requestedSource = text(getQuery(event).source)
  if (requestedSource === 'test' && !import.meta.dev) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Test Project data is unavailable in production.',
    })
  }
  const documents =
    requestedSource === 'test'
      ? (await db.collection('test-projects').get()).docs
      : await (async () => {
          const supports = appRef.collection(ProjectStorage.scopeCollection)
          const snapshots = await Promise.all([
            supports.where('operator_ids', 'array-contains', uid).get(),
            supports.where('team_ids', 'array-contains', uid).get(),
          ])
          const ids = [
            ...new Set(
              snapshots.flatMap(snapshot =>
                snapshot.docs.map(document => document.id)
              )
            ),
          ]
          if (ids.length === 0) return []
          const roots = await db.getAll(
            ...ids.map(id =>
              db.collection(ProjectStorage.rootCollection).doc(id)
            )
          )
          return roots.filter(document => document.exists)
        })()
  const items = documents
    .map((document) => {
      const source = (document.data() || {}) as Record<string, unknown>
      const rawStatus = text(source.status) as ProjectStatus
      return {
        id: document.id,
        name: text(source.name),
        slug: text(source.slug),
        description: text(source.description),
        image_url: text(source.image_url),
        status: PROJECT_STATUSES.has(rawStatus) ? rawStatus : 'draft',
      }
    })
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true as const,
    items,
  }
})
