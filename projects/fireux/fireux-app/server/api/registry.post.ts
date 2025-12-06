import { defineEventHandler, readBody, createError } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
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
  ecosystem?: string
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
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

  const requiresEcosystem = type === 'app'
  if (requiresEcosystem && !payload.ecosystem) {
    throw createError({
      statusCode: 400,
      statusMessage: 'App payloads must include an "ecosystem" field.',
    })
  }

  const collection = COLLECTION_SEGMENTS[type]
  const normalizedId = id.toLowerCase()
  const normalizedName = name.toLowerCase()
  const normalizedTeam = team.toLowerCase()

  const normalizedEcosystem = requiresEcosystem
    ? toSlug(payload.ecosystem as string)
    : undefined

  if (requiresEcosystem && !normalizedEcosystem) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'App payloads must provide a valid ecosystem slug (letters, numbers, dashes).',
    })
  }

  const path = `${collection}/${normalizedId}`
  const db = await getFirestoreDb('registry')

  const docData: Record<string, string> = {
    name: normalizedName,
    team: normalizedTeam,
  }

  if (normalizedEcosystem) {
    docData.ecosystem = normalizedEcosystem
  }

  await db.doc(path).set(docData, { merge: true })

  if (requiresEcosystem && normalizedEcosystem) {
    await db
      .doc(`${COLLECTION_SEGMENTS.ecosystem}/${normalizedEcosystem}`)
      .set({ apps: FieldValue.arrayUnion(normalizedId) }, { merge: true })
  }

  return {
    ok: true,
    path,
    id: normalizedId,
    ecosystem: normalizedEcosystem,
  }
})
