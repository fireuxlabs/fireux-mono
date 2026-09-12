import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
// Concurrent edit — 2026-07-20 16:00 CEST — FireUX dev recovery: resolve cross-package server imports explicitly.
import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { type Project } from 'fireux-core/runtime/project/models/project.model'
import { readProjectDocument } from 'fireux-core/runtime/project/utils/readProject'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireWorkspaceEntityMemberRole } from 'fireux-core/runtime/server/utils/workspace-entity/onboarding-authority'
import { getFirestoreDb } from '../../utils/firebase-admin'
import { serverProjectAccessTarget } from 'fireux-core/runtime/project/server/access'

const text = (value: unknown) => String(value ?? '').trim()
export async function readProjectIndex(event: H3Event, requestedId = '') {
  const { uid } = await requireFirebaseBearerUser(event)
  const runtime = useRuntimeConfig()
  const appId = text(runtime.public?.fireux?.id)
  if (!appId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'The FireUX App identity is not configured.',
    })
  }

  const db = await getFirestoreDb('fireux')
  const appRef = db.collection('apps').doc(appId)
  const [appSnapshot, membershipSnapshot, accessSnapshot] = await Promise.all([
    appRef.get(),
    appRef.collection('users').doc(uid).get(),
    db
      .collection(serverProjectAccessTarget(appId).collectionPath)
      .doc(uid)
      .get(),
  ])
  const membership = (membershipSnapshot.data() || {}) as Record<
    string,
    unknown
  >
  if (!appSnapshot.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: 'FireUX App membership is required.',
    })
  }
  requireWorkspaceEntityMemberRole({
    exists: membershipSnapshot.exists,
    role: membership.role,
    entityLabel: 'Project',
  })

  const ids = readMembershipAccessIds(accessSnapshot.data(), membership)
  if (requestedId && !ids.includes(requestedId)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Project membership is required.',
    })
  }
  const requestedIds = requestedId ? [requestedId] : ids
  const documents = requestedIds.length
    ? (
        await db.getAll(
          ...requestedIds.map((id) => db.collection('projects').doc(id))
        )
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
    project_ids: ids,
    items,
  }
}
