import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { deleteStorageFileIfExists } from 'fireux-core/runtime/server/utils/uploads/storage'
import { requireKitchenWriterAccount } from '../../../kitchen/server/core/operator-access'
import { serverKitchenMenuUploadsTarget } from '../../../kitchen/server/mutation-targets'
import {
  assertKitchenMenuCurrencyCode,
  requireMenuName,
  saveKitchenMenuUploadFiles,
  kitchenMenuUploadRecord,
  kitchenMenuUploadResponse,
  storagePathsFromMenuUpload,
  type KitchenMenuUploadRequest,
} from './uploads'
import {
  kitchenMenuUrlSourceRecord,
  type KitchenMenuUrlSourceRequest,
} from './url-sources'

type MenuSourceInput = KitchenMenuUploadRequest | KitchenMenuUrlSourceRequest

/** Shared source command. HTTP uploads and trusted service adapters use the same owner. */
export async function saveKitchenMenuSource(
  input: MenuSourceInput,
  uid: string
) {
  requireMenuName(input.uploadId)
  const target = serverKitchenMenuUploadsTarget(input.kitchenId)
  const fingerprint = createHash('sha256')
    .update(
      JSON.stringify({
        appId: input.appId,
        kitchenId: input.kitchenId,
        source:
          'files' in input
            ? input.files.map((file) => ({
                name: file.fileName,
                type: file.contentType,
                hash: createHash('sha256').update(file.data).digest('hex'),
              }))
            : input.sourceUrl,
      })
    )
    .digest('hex')
  const inspect = async (
    tx: Parameters<Parameters<typeof runGuardedServerTransaction>[1]>[0]
  ) => {
    await requireKitchenWriterAccount(
      { appId: input.appId, kitchenId: input.kitchenId },
      uid,
      tx
    )
    const existing = await tx.read(target, input.uploadId)
    if (existing.exists && !input.replaceExisting) {
      if (existing.data?.input_fingerprint !== fingerprint)
        throw createError({
          statusCode: 409,
          statusMessage:
            'This source belongs to another preparation. Nothing was overwritten.',
        })
    }
    return existing
  }
  const before = await runGuardedServerTransaction({ kind: 'runtime' }, inspect)
  await assertKitchenMenuCurrencyCode(input.appId, input.kitchenId)
  if (before.exists && !input.replaceExisting)
    return { ok: true as const, id: input.uploadId }
  const files =
    'files' in input ? await saveKitchenMenuUploadFiles(input) : null
  const data =
    files && 'files' in input
      ? kitchenMenuUploadRecord(input, files, uid)
      : kitchenMenuUrlSourceRecord(input as KitchenMenuUrlSourceRequest, uid)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const current = await inspect(tx)
    if (current.exists && !input.replaceExisting) return
    const record = { ...data, input_fingerprint: fingerprint }
    if (current.exists)
      tx.update(target, input.uploadId, {
        ...record,
        ai_draft: FieldValue.delete(),
        menu_id: FieldValue.delete(),
        ...('files' in input
          ? {
              source_url: FieldValue.delete(),
              source_provider: FieldValue.delete(),
            }
          : {}),
      })
    else tx.create(target, input.uploadId, record)
  })
  if (input.replaceExisting && before.exists) {
    const retained = new Set(files?.map((file) => file.objectPath) || [])
    await Promise.all(
      storagePathsFromMenuUpload(before.data)
        .filter((path) => !retained.has(path))
        .map((objectPath) => deleteStorageFileIfExists({ objectPath }))
    )
  }
  return files && 'files' in input
    ? kitchenMenuUploadResponse(input, files)
    : {
        ok: true as const,
        id: input.uploadId,
        slug: input.uploadId,
        source_url: (input as KitchenMenuUrlSourceRequest).sourceUrl,
        source_provider: (input as KitchenMenuUrlSourceRequest).sourceProvider,
        storage_owner: 'external',
        storage_app_id: input.appId,
      }
}
