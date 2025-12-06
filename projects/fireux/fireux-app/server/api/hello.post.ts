import { defineEventHandler, readBody, createError } from 'h3'
import { getFirestoreDb } from './firebase-admin'

type RegistryType = 'module' | 'app' | 'ecosystem'

const COLLECTION_SEGMENTS: Record<RegistryType, string> = {
  module: 'modules',
  app: 'apps',
  ecosystem: 'ecosystems',
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveId(type: RegistryType, id: string | undefined, name: string) {
  if (id) return id
  const base = slugify(name)
  if (type === 'module' && base && !base.startsWith('fireux-')) {
    return `fireux-${base}`
  }
  return base || name
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    type?: RegistryType
    id?: string
    name?: string
    data?: Record<string, any>
  }>(event)

  const type = body?.type
  const name = body?.name

  if (!type || !(type in COLLECTION_SEGMENTS)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Body must include a valid "type" (module, app, ecosystem).',
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must include a "name" field.',
    })
  }

  const collection = COLLECTION_SEGMENTS[type]
  const id = resolveId(type, body.id, name)
  const now = new Date().toISOString()

  const payload = {
    id,
    type,
    name,
    title: body.data?.title ?? name,
    status: body.data?.status ?? 'draft',
    ...body.data,
    updatedAt: now,
    updatedBy: body.data?.updatedBy ?? 'hello-endpoint',
  }

  if (!payload.createdAt) {
    payload.createdAt = now
  }

  const path = `registry/${collection}/records/${id}`
  const db = await getFirestoreDb('registry')
  await db.doc(path).set(payload, { merge: true })

  return {
    ok: true,
    path,
    id,
  }
})
