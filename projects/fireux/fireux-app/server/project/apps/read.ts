import { createError, type H3Event } from 'h3'
import { readAppDocument } from 'fireux-core/runtime/app/utils/readApp'
import { requireProjectOperator } from '../core/authority'
import { PLATFORM_DIRECTORY_TARGETS } from '../../config/platform-directory-targets'
import { getFirestoreProjectDb } from '../../utils/firebase-admin'

/** Read only Apps belonging to Ecosystems owned by the authorized Project. */
export async function readProjectApps(event: H3Event, id: unknown) {
  const { db, projectId } = await requireProjectOperator(event, id)
  const ecosystems = await db.collection('ecosystems').where('project_id', '==', projectId).get()
  const groups = await Promise.all(ecosystems.docs.map(async (ecosystem) => {
    const target = PLATFORM_DIRECTORY_TARGETS.find(entry => entry.ecosystemId === ecosystem.id)
    if (!target) throw createError({ statusCode: 409, statusMessage: 'An Ecosystem has no configured App database.' })
    const appDb = await getFirestoreProjectDb(target.projectId, target.databaseId)
    const snapshot = await appDb.collection('apps').where('ecosystem_id', '==', ecosystem.id).get()
    return snapshot.docs.map(document => {
      const app = readAppDocument(document.data(), document.id)
      if (!app) throw createError({ statusCode: 409, statusMessage: `App ${document.id} has an invalid stored shape.` })
      return app
    })
  }))
  const items = groups.flat().sort((a, b) => a.name.localeCompare(b.name))
  if (new Set(items.map(app => app.id)).size !== items.length) {
    throw createError({ statusCode: 409, statusMessage: 'Duplicate App identities exist across Project databases.' })
  }
  return { ok: true as const, project_id: projectId, items }
}
