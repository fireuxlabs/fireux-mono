import { defineEventHandler, readBody, createError } from 'h3'
import { getFirestoreDb } from './firebase-admin'

type RegistryType = 'module' | 'app' | 'ecosystem'

const COLLECTION_SEGMENTS: Record<RegistryType, string> = {
  module: 'modules',
  app: 'apps',
  ecosystem: 'ecosystems',
}

type RegistryPayload = {
  id?: string
  name?: string
  team?: string
  type?: RegistryType
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    type?: RegistryType
    payload?: RegistryPayload
  }>(event)

  const payload = body?.payload
  const type = body?.type || payload?.type

  if (!type || !(type in COLLECTION_SEGMENTS)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Body must include a valid "type" (module, app, ecosystem).',
    })
  }

  if (!payload || typeof payload !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must include a "payload" object.',
    })
  }

  const { id, name, team } = payload

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload must include an "id" field.',
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload must include a "name" field.',
    })
  }

  if (!team) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload must include a "team" field.',
    })
  }

  const collection = COLLECTION_SEGMENTS[type]
  const normalizedId = id.toLowerCase()
  const normalizedName = name.toLowerCase()
  const normalizedTeam = team.toLowerCase()

  const path = `${collection}/${normalizedId}`
  const db = await getFirestoreDb('registry')
  await db.doc(path).set({ name: normalizedName, team: normalizedTeam }, { merge: true })

  return {
    ok: true,
    path,
    id: normalizedId,
  }
})
