import { randomUUID } from 'node:crypto'
import {
  createError,
  getRequestHeader,
  getRequestURL,
  type H3Event,
} from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { GoQrToolId } from './types'

const text = (value: unknown) => String(value ?? '').trim()

export const toolPublicOrigin = (event: H3Event) => {
  const host = (
    getRequestHeader(event, 'x-forwarded-host') ||
    getRequestHeader(event, 'host') ||
    ''
  ).trim()
  const proto = (
    getRequestHeader(event, 'x-forwarded-proto') ||
    getRequestURL(event).protocol.replace(':', '') ||
    'https'
  ).trim()

  return host ? `${proto}://${host}` : getRequestURL(event).origin
}

export async function createToolConfig(
  event: H3Event,
  tool: GoQrToolId,
  config: Record<string, unknown>
) {
  const id = randomUUID()
  const path = `/tools/${tool}/${encodeURIComponent(id)}`

  await getRuntimeFirestore()
    .collection('tools')
    .doc(tool)
    .collection('configs')
    .doc(id)
    .set({
      id,
      tool,
      config,
      created: {
        at: FieldValue.serverTimestamp(),
      },
    })

  return {
    ok: true,
    tool,
    id,
    path,
    toolUrl: new URL(path, toolPublicOrigin(event)).toString(),
  }
}

export async function readToolConfig(tool: GoQrToolId, id: unknown) {
  const configId = text(id)
  if (!configId) {
    throw createError({ statusCode: 400, statusMessage: 'Tool id is required.' })
  }

  const snap = await getRuntimeFirestore()
    .collection('tools')
    .doc(tool)
    .collection('configs')
    .doc(configId)
    .get()

  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tool not found.' })
  }

  return {
    id: configId,
    config: snap.data()?.config ?? {},
  }
}
