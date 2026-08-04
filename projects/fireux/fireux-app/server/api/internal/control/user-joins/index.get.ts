import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  ProjectUserJoinStorage,
  type ProjectUserJoinFeedItem,
} from 'fireux-core/runtime/models/operations/project-user-join.model.ts'
import { getFirestoreDb } from '../../../../utils/firebase-admin'
import { requireFireuxAppAdmin } from '../../../../utils/require-fireux-app-admin'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event: H3Event) => {
  await requireFireuxAppAdmin(event)
  const db = await getFirestoreDb(ProjectUserJoinStorage.database)
  const rawLimit = Number(getQuery(event).limit || 100)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200)
    : 100
  const snapshot = await db
    .collection(ProjectUserJoinStorage.collection)
    .doc(ProjectUserJoinStorage.document)
    .get()

  const monitor = (snapshot.data() || {}) as Record<string, unknown>
  const rows =
    monitor.version === 1 && Array.isArray(monitor.items)
      ? monitor.items.slice(0, limit)
      : []
  const items = rows.flatMap<ProjectUserJoinFeedItem>((value) => {
    const data =
      value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {}
    const source =
      data.source &&
      typeof data.source === 'object' &&
      !Array.isArray(data.source)
        ? (data.source as Record<string, unknown>)
        : {}
    const occurredAt = data.occurred_at as { toDate?: () => Date } | undefined
    const occurredAtDate = occurredAt?.toDate?.()
    const role = text(data.membership_role)
    if (
      data.version !== 1 ||
      !text(data.event_id) ||
      !text(data.user_id) ||
      (role !== 'admin' && role !== 'user') ||
      !occurredAtDate ||
      !Number.isFinite(occurredAtDate.getTime())
    ) {
      return []
    }

    return [
      {
        id: text(data.id),
        event_id: text(data.event_id),
        firebase_project_id: text(source.firebase_project_id),
        database_id: text(source.database_id),
        project_id: text(source.project_id),
        ecosystem_id: text(source.ecosystem_id),
        app_id: text(source.app_id),
        user_id: text(data.user_id),
        membership_role: role,
        occurred_at: occurredAtDate.toISOString(),
      },
    ]
  })

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return {
    ok: true as const,
    items,
    count: items.length,
  }
})
