import { ItemStorage } from '../../../../../../kitchen/item/storage'
// Concurrent edit — 2026-07-22 00:38 CEST — Item image server: expose the authenticated canonical Item image mutation.
import { useRuntimeConfig } from '#imports'
import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readMultipartFormData,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { readString } from 'fireux-core/runtime/server/utils/records/read'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { readUploadedMultipartFile } from 'fireux-core/runtime/server/utils/uploads/multipart'

import { normalizeAndSaveItemImage } from '../../../../../../kitchen/server/items/image.ts'
import {
  requireKitchenWriter,
  requireKitchenWriterAccount,
} from '../../../../../../kitchen/server/core/operator-access.ts'
import { serverKitchenItemsTarget } from '../../../../../../kitchen/server/mutation-targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
const extensionTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const assertItemIdentity = (
  exists: boolean,
  data: Record<string, unknown>,
  kitchenId: string
) => {
  if (!exists) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found.' })
  }
  if (readString(data.kitchen_id) !== kitchenId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The stored Item identity is invalid.',
    })
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const runtime = useRuntimeConfig()
  const query = getQuery(event)
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const kitchenId = requirePathSegment(query.kitchenId, 'Kitchen id')
  const dishId = requirePathSegment(getRouterParam(event, 'dishId'), 'Item id')
  const { db, uid } = await requireKitchenWriter(event, { appId, kitchenId })
  const itemRef = db.doc(
    `kitchens/${kitchenId}/${ItemStorage.collection}/${dishId}`
  )
  const itemSnapshot = await itemRef.get()
  const itemData = itemSnapshot.data() ?? {}
  assertItemIdentity(itemSnapshot.exists, itemData, kitchenId)

  const parts = await readMultipartFormData(event)
  const file = readUploadedMultipartFile(parts, {
    label: 'Item image',
    defaultFileName: 'dish-image',
    maxFileSizeMb: 10,
    allowedTypes,
    extensionTypes,
    invalidTypeMessage: 'Upload a JPEG, PNG, or WebP Item image.',
  })
  const previousImage = readString(itemData.image)
  const saved = await normalizeAndSaveItemImage({
    appId,
    kitchenId,
    dishId,
    data: file.data,
  })

  let committed = false
  try {
    await runGuardedServerTransaction(
      { kind: 'runtime' },
      async (transaction) => {
        await requireKitchenWriterAccount(
          { appId, kitchenId },
          uid,
          transaction
        )
        const target = serverKitchenItemsTarget(kitchenId)
        const current = await transaction.read(target, dishId)
        assertItemIdentity(current.exists, current.data ?? {}, kitchenId)
        if (readString(current.data?.image) !== previousImage) {
          throw createError({
            statusCode: 409,
            statusMessage:
              'The Item image changed during upload. Please try again.',
          })
        }
        transaction.update(target, dishId, {
          image: saved.imageUrl,
          updated: serverAuditStamp({ by: uid }),
        })
      }
    )
    committed = true
  } catch (error) {
    try {
      const current = await itemRef.get()
      committed = Boolean(
        current.exists &&
          readString(current.get('kitchen_id')) === kitchenId &&
          readString(current.get('image')) === saved.imageUrl
      )
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Item image save outcome could not be confirmed. Refresh the Item before retrying.',
      })
    }

    if (committed) {
      // The transaction committed but its response was interrupted.
    } else {
      try {
        await saved.deleteUploaded()
      } catch {
        throw createError({
          statusCode: 500,
          statusMessage:
            'Item image save failed and its unreferenced upload could not be removed.',
        })
      }
      throw error
    }
  }

  setResponseHeaders(event, {
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true as const,
    dish_id: dishId,
    image: saved.imageUrl,
    object_path: saved.objectPath,
  }
})
