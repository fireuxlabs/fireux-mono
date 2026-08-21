import { useRuntimeConfig } from '#imports'
import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { DishStorage } from '../../../../../../kitchen/models/dish.model.ts'
import { requireKitchenWriter } from '../../../../../../kitchen/server/core/operator-access.ts'

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const kitchenId = requirePathSegment(getQuery(event).kitchenId, 'Kitchen id')
  const dishId = requirePathSegment(getRouterParam(event, 'dishId'), 'Dish id')
  const body = await readBody<{ is_flagship?: unknown }>(event)
  const isFlagship = body?.is_flagship === true
  const { db, uid } = await requireKitchenWriter(event, { appId, kitchenId })
  const collection = db.collection(
    `kitchens/${kitchenId}/${DishStorage.collection}`
  )
  const target = collection.doc(dishId)

  await db.runTransaction(async (transaction) => {
    const targetSnapshot = await transaction.get(target)
    if (!targetSnapshot.exists)
      throw createError({ statusCode: 404, statusMessage: 'Dish not found.' })

    if (isFlagship) {
      const previous = await transaction.get(
        collection.where('is_flagship', '==', true)
      )
      for (const snapshot of previous.docs) {
        if (snapshot.id !== dishId) {
          transaction.update(snapshot.ref, {
            is_flagship: false,
            updated: serverAuditStamp({ by: uid }),
          })
        }
      }
    }

    transaction.update(target, {
      is_flagship: isFlagship,
      updated: serverAuditStamp({ by: uid }),
    })
  })

  return { ok: true as const, dish_id: dishId, is_flagship: isFlagship }
})
