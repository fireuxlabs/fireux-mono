import { createError, setHeader, type H3Event } from 'h3'
import {
  downloadStorageFile,
  parseFirebaseStorageDownloadUrl,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import type { MenuDocument } from '../../models/menu.model'
import { menuDocumentFileIdentity } from '../../utils/records/file-identity'
import { isKitchenMenuDocumentPath, menuDocumentContentTypes } from './file'

export type ProtectedMenuFileTarget = {
  kitchenId: string
  kitchen: Record<string, unknown>
  document: Partial<MenuDocument>
  revision: string
  sourceId?: string
  fileId?: string
}

const changed = () =>
  createError({
    statusCode: 409,
    statusMessage: 'This file has changed. Refresh its preview and try again.',
  })

function requireOwnedFile(target: ProtectedMenuFileTarget, bucketName: string) {
  const path = String(target.document.storage_path || '').trim()
  const url = String(target.document.url || '').trim()
  const parsed = parseFirebaseStorageDownloadUrl(url)
  if (
    !isKitchenMenuDocumentPath(path, target.kitchenId, target.kitchen) ||
    (target.sourceId && path.split('/').at(-3) !== target.sourceId) ||
    (url &&
      (!parsed ||
        parsed.bucketName !== bucketName ||
        parsed.objectPath !== path))
  )
    throw createError({
      statusCode: 404,
      statusMessage: 'This file is not available for a protected preview.',
    })
  return path
}

function targetIdentity(target: ProtectedMenuFileTarget) {
  return JSON.stringify([
    target.kitchenId,
    target.sourceId || '',
    target.fileId || '',
    target.revision,
    menuDocumentFileIdentity({ doc: target.document }),
  ])
}

/** Trusted adapters prove current authority and select exact stored records on every resolve. */
export async function readProtectedMenuFile(input: {
  expectedRevision: string
  resolve: () => Promise<ProtectedMenuFileTarget>
}) {
  if (!/^[a-f0-9]{64}$/.test(input.expectedRevision || ''))
    throw createError({
      statusCode: 400,
      statusMessage: 'A current file revision is required.',
    })
  const before = await input.resolve()
  if (before.revision !== input.expectedRevision) throw changed()
  const bucketName = runtimeStorageBucketName()
  const objectPath = requireOwnedFile(before, bucketName)
  let buffer: Buffer
  try {
    const file = await downloadStorageFile({
      objectPath,
      bucketName,
      maxBytes: 10 * 1024 * 1024,
    })
    buffer = file.buffer
  } catch (error) {
    const code = Number(
      (error as { statusCode?: number; code?: number }).statusCode ||
        (error as { code?: number }).code
    )
    throw createError({
      statusCode:
        code === 413 ? 413 : code === 404 ? 404 : code === 409 ? 409 : 503,
      statusMessage:
        code === 413
          ? 'This file is too large to preview.'
          : 'This file could not be loaded. Refresh its preview and try again.',
    })
  }
  const after = await input.resolve()
  requireOwnedFile(after, bucketName)
  if (
    after.revision !== input.expectedRevision ||
    targetIdentity(before) !== targetIdentity(after)
  )
    throw changed()
  const type = String(after.document.type || '')
    .trim()
    .toLowerCase()
  const contentType = menuDocumentContentTypes.includes(type)
    ? type
    : 'application/octet-stream'
  const fileName =
    String(after.document.name || 'menu-document')
      .replace(/[\r\n"\\]/g, '_')
      .replace(/[^\x20-\x7e]/g, '_')
      .slice(0, 200) || 'menu-document'
  return { buffer, contentType, fileName }
}

export function setProtectedMenuFileResponse(
  event: H3Event,
  result: Awaited<ReturnType<typeof readProtectedMenuFile>>
) {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Content-Type', result.contentType)
  setHeader(
    event,
    'Content-Disposition',
    `${result.contentType === 'application/octet-stream' ? 'attachment' : 'inline'}; filename="${result.fileName}"`
  )
  return result.buffer
}
