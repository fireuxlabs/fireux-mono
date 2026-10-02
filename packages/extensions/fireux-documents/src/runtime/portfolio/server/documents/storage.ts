import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { getStorage } from 'firebase-admin/storage'
import { getAdminApp } from 'fireux-core/runtime/server/utils/getAdmin'
import { runtimeStorageBucketName, firebaseStorageDownloadUrl } from 'fireux-core/runtime/server/utils/uploads/storage'

/** Create-only object ownership. Uncertain saves are retained for the same request to retry. */
export async function storePortfolioDocument(input: { portfolioId: string; requestId: string; fingerprint: string; data: Buffer; contentType: string }) {
  const bucketName = runtimeStorageBucketName()
  const objectPath = `portfolios/${input.portfolioId}/documents/${input.requestId}/file`
  const file = getStorage(getAdminApp()).bucket(bucketName).file(objectPath, { preconditionOpts: { ifGenerationMatch: 0 } })
  const token = randomUUID()
  try {
    await file.save(input.data, { resumable: false, validation: 'md5', metadata: { contentType: input.contentType, metadata: { firebaseStorageDownloadTokens: token, fireuxDocumentRequest: input.fingerprint } } })
  } catch (error) {
    // A timeout can mean the object was saved. Inspect ownership; never overwrite or delete it.
    const [metadata] = await file.getMetadata().catch(() => { throw error })
    if (metadata.metadata?.fireuxDocumentRequest !== input.fingerprint) throw createError({ statusCode: 409, statusMessage: 'This upload request already belongs to another file or account.' })
  }
  const [metadata] = await file.getMetadata()
  if (metadata.metadata?.fireuxDocumentRequest !== input.fingerprint || !metadata.metadata?.firebaseStorageDownloadTokens) throw createError({ statusCode: 409, statusMessage: 'Upload ownership could not be verified.' })
  return { storage_path: objectPath, download_url: firebaseStorageDownloadUrl(bucketName, objectPath, String(metadata.metadata.firebaseStorageDownloadTokens)) }
}
