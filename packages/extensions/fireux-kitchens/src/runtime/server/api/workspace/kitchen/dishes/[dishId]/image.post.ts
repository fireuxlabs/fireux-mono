// Concurrent edit — 2026-07-22 00:38 CEST — Dish image server: expose the authenticated canonical Dish image mutation.
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
import { DishStorage } from '../../../../../../kitchen/utils/dish.ts'
import { normalizeAndSaveDishImage } from '../../../../../../kitchen/server/dishes/image.ts'
import {
  requireKitchenWriter,
  requireKitchenWriterAccount,
} from '../../../../../../kitchen/server/core/operator-access.ts'
import { serverKitchenDishesTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
const extensionTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const assertDishIdentity = (
  exists: boolean,
  data: Record<string, unknown>,
  kitchenId: string
) => {
  if (!exists) {
    throw createError({ statusCode: 404, statusMessage: 'Dish not found.' })
  }
  if (readString(data.kitchen_id) !== kitchenId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'The stored Dish identity is invalid.',
    })
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const runtime = useRuntimeConfig()
  const query = getQuery(event)
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const kitchenId = requirePathSegment(query.kitchenId, 'Kitchen id')
  const dishId = requirePathSegment(getRouterParam(event, 'dishId'), 'Dish id')
  const { db, uid } = await requireKitchenWriter(event, { appId, kitchenId })
  const dishRef = db.doc(
    `kitchens/${kitchenId}/${DishStorage.collection}/${dishId}`
  )
  const dishSnapshot = await dishRef.get()
  const dishData = dishSnapshot.data() ?? {}
  assertDishIdentity(dishSnapshot.exists, dishData, kitchenId)

  const parts = await readMultipartFormData(event)
  const file = readUploadedMultipartFile(parts, {
    label: 'Dish image',
    defaultFileName: 'dish-image',
    maxFileSizeMb: 10,
    allowedTypes,
    extensionTypes,
    invalidTypeMessage: 'Upload a JPEG, PNG, or WebP Dish image.',
  })
  const previousImage = readString(dishData.image)
  const saved = await normalizeAndSaveDishImage({
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
        const target = serverKitchenDishesTarget(kitchenId)
        const current = await transaction.read(target, dishId)
        assertDishIdentity(current.exists, current.data ?? {}, kitchenId)
        if (readString(current.data?.image) !== previousImage) {
          throw createError({
            statusCode: 409,
            statusMessage:
              'The Dish image changed during upload. Please try again.',
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
      const current = await dishRef.get()
      committed = Boolean(
        current.exists &&
          readString(current.get('kitchen_id')) === kitchenId &&
          readString(current.get('image')) === saved.imageUrl
      )
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Dish image save outcome could not be confirmed. Refresh the Dish before retrying.',
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
            'Dish image save failed and its unreferenced upload could not be removed.',
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
