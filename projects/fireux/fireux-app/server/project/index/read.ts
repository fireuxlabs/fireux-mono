// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { type Project } from 'fireux-core/runtime/project/models/project.model'
import { readProjectDocument } from 'fireux-core/runtime/project/utils/readProject'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getFirestoreDb } from '../../utils/firebase-admin'

const text = (value: unknown) => String(value ?? '').trim()
export async function readProjectIndex(event: H3Event) {
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
  const appRef = db.collection('apps').doc(appId)
  const [appSnapshot, membershipSnapshot] = await Promise.all([
    appRef.get(),
    appRef.collection('users').doc(uid).get(),
  ])
  const membership = (membershipSnapshot.data() || {}) as Record<
    string,
    unknown
  >
  const hasMembership =
    text(membership.role) === 'admin' || text(membership.role) === 'user'

  if (!appSnapshot.exists || !hasMembership) {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
    })
  }

  const team = await db
    .collectionGroup('team')
    .where('user_id', '==', uid)
    .limit(100)
    .get()
  const ids = [
    ...new Set(
      team.docs.flatMap((member) => {
        const parts = member.ref.path.split('/')
        const role = text(member.get('role'))
        if (
          parts.length !== 4 ||
          parts[0] !== 'projects' ||
          parts[2] !== 'team' ||
          parts[3] !== uid ||
          text(member.get('user_id')) !== uid ||
          text(member.get('status')) !== 'active' ||
          (role !== 'owner' && role !== 'operator' && role !== 'member')
        ) {
          return []
        }
        return [parts[1]]
      })
    ),
  ]
  const documents = ids.length
    ? (
        await db.getAll(...ids.map((id) => db.collection('projects').doc(id)))
      ).filter((document) => document.exists)
    : []
  const items: Project[] = documents
    .map((document): Project => {
      const project = readProjectDocument(document.data(), document.id)
      if (!project) {
        throw createError({
          statusCode: 409,
          statusMessage: `Invalid canonical Project: projects/${document.id}`,
        })
      }
      return project
    })
    .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))

  return {
    ok: true as const,
    items,
  }
}
