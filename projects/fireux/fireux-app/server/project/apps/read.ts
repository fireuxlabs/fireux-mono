import { createError, type H3Event } from 'h3'
import {
  appCollectionPage,
  readAppRecords,
} from 'fireux-core/runtime/app/server/collection/read'
import { requireProjectOperator } from '../core/authority'
import { PLATFORM_DIRECTORY_TARGETS } from '../../config/platform-directory-targets'
import { getFirestoreProjectDb } from '../../utils/firebase-admin'

/** Read only Apps belonging to Ecosystems owned by the authorized Project. */
export async function readProjectApps(event: H3Event, id: unknown) {
  const { db, projectId } = await requireProjectOperator(event, id)
  const ecosystems = await db
    .collection('ecosystems')
    .where('project_id', '==', projectId)
    .get()
  const groups = await Promise.all(
    ecosystems.docs.map(async (ecosystem) => {
      const target = PLATFORM_DIRECTORY_TARGETS.find(
        (entry) => entry.ecosystemId === ecosystem.id
      )
      if (!target)
        throw createError({
          statusCode: 409,
          statusMessage: 'An Ecosystem has no configured App database.',
        })
      const appDb = await getFirestoreProjectDb(
        target.projectId,
        target.databaseId
      )
      return readAppRecords(appDb, { ecosystemId: ecosystem.id })
    })
  )
  const page = appCollectionPage(groups.flat())
  return {
    ...page,
    project_id: projectId,
    items: page.items.sort((a, b) => a.name.localeCompare(b.name)),
  }
}
