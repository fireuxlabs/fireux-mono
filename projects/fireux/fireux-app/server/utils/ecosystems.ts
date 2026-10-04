import { createError } from 'h3'
import { readEcosystem } from 'fireux-core/runtime/ecosystem/server/identity/read'
import { PLATFORM_DIRECTORY_TARGETS } from '../config/platform-directory-targets'
import { getFirestoreProjectDb } from './firebase-admin'

/** Platform scope selects approved infrastructure; Core owns canonical validation. */
export async function readPlatformEcosystem(
  id: string,
  options: { activeOnly?: boolean } = {}
) {
  const target = PLATFORM_DIRECTORY_TARGETS.find(
    (entry) => entry.ecosystemId === id
  )
  if (!target)
    throw createError({
      statusCode: 404,
      statusMessage: 'Ecosystem not found.',
    })
  const database = await getFirestoreProjectDb(
    target.projectId,
    target.databaseId
  )
  return readEcosystem(id, database, options)
}

export function readPlatformEcosystems(options: { activeOnly?: boolean } = {}) {
  return Promise.all(
    PLATFORM_DIRECTORY_TARGETS.map((target) =>
      readPlatformEcosystem(target.ecosystemId, options)
    )
  )
}
