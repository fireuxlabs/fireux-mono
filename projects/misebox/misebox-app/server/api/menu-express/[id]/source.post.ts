import { requireChatSessionAccess } from 'fireux-core/runtime/server/utils/chat/session'
import { createHash } from 'node:crypto'
import { getStorage } from 'firebase-admin/storage'
import { defineEventHandler, getRouterParam, readMultipartFormData } from 'h3'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import {
  readUploadedMultipartFile,
  multipartField,
} from 'fireux-core/runtime/server/utils/uploads/multipart'
import { runtimeStorageBucketName } from 'fireux-core/runtime/server/utils/uploads/storage'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { context } from '../../../menu-express/authority'
import { fail, requestId } from '../../../menu-express/contract'
export default defineEventHandler(async (event) => {
  const id = requestId(getRouterParam(event, 'id')),
    { appId, target } = context(event)
  const parts = await readMultipartFormData(event),
    token = multipartField(parts, 'token')
  const file = readUploadedMultipartFile(parts, {
    label: 'Menu source',
    defaultFileName: 'menu',
    maxFileSizeMb: 6,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    invalidTypeMessage: 'Upload a PDF, JPEG, PNG or WebP.',
  })
  const bytes = file.data
  const signatures: Record<string, boolean> = {
    'application/pdf': bytes.subarray(0, 5).toString() === '%PDF-',
    'image/jpeg': bytes[0] === 255 && bytes[1] === 216,
    'image/png': bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    'image/webp':
      bytes.subarray(0, 4).toString() === 'RIFF' &&
      bytes.subarray(8, 12).toString() === 'WEBP',
  }
  if (!signatures[file.contentType])
    fail('File contents do not match the selected type.')
  const sourceId = createHash('sha256').update(bytes).digest('hex')
  const objectPath = `apps/${appId}/menu-express/${id}/sources/${sourceId}`
  const check = async (
    tx: Parameters<Parameters<typeof runGuardedServerTransaction>[1]>[0]
  ) => {
    await requireChatSessionAccess(tx, { appId, conversationId: id, token })
    const record = await tx.read(target, id)
    if (!record.exists) fail('Request not found.', 404)
    if (record.data?.stage !== 'received')
      fail('Send later source changes through your conversation.', 409)
    if (
      record.data?.sources?.length >= 5 &&
      !record.data.sources.some((s: any) => s.id === sourceId)
    )
      fail('This request already has five source files.', 409)
    return record.data!
  }
  await runGuardedServerTransaction({ kind: 'runtime' }, check)
  // Private object: no download token or public ACL. Readers use the protected route.
  await getStorage(getAdminApp())
    .bucket(runtimeStorageBucketName())
    .file(objectPath)
    .save(bytes, {
      resumable: false,
      metadata: {
        contentType: file.contentType,
        cacheControl: 'private, no-store',
      },
      preconditionOpts: { ifGenerationMatch: 0 },
    })
    .catch((error) => {
      if (error.code !== 412) throw error
    })
  try {
    return await runGuardedServerTransaction(
      { kind: 'runtime' },
      async (tx) => {
        const record = await check(tx)
        const sources = [...(record.sources || [])]
        if (!sources.some((s) => s.id === sourceId))
          sources.push({
            id: sourceId,
            name: file.fileName,
            type: file.contentType,
          })
        tx.update(target, id, { sources, updatedAt: new Date().toISOString() })
        return { sources }
      }
    )
  } catch (error) {
    // Content-addressed retries can share this object. Preserve it for recovery.
    throw error
  }
})
