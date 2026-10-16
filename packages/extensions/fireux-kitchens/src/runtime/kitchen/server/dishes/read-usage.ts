import type { H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../core/mutation-authority'
import { readDishUsage } from './usage'
import type { DishUsageResponse } from '../../models/dish-usage.model'

export async function readKitchenDishUsage(
  event: H3Event,
  input: { kitchenId: unknown; dishId: unknown }
): Promise<DishUsageResponse> {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const dishId = requireFirestoreDocumentId(input.dishId, 'Dish id')
  const actor = await readKitchenMutationActor(event)
  const db = getRuntimeFirestore()
  await requireKitchenRecordMutationAuthority(
    {
      async read(target, id) {
        const snapshot = await db
          .collection(target.collectionPath)
          .doc(id)
          .get()
        return { exists: snapshot.exists, data: snapshot.data() as any }
      },
    },
    actor,
    kitchenId
  )
  const usages = await readDishUsage(
    {
      async readAll(target, limit) {
        const snapshot = await db
          .collection(target.collectionPath)
          .limit(limit)
          .get()
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as any,
        }))
      },
      async query(target, input) {
        const snapshot = await db
          .collection(target.collectionPath)
          .where(input.field, input.op, input.value)
          .limit(input.limit)
          .get()
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data() as any,
        }))
      },
    },
    kitchenId,
    dishId
  )
  return { kitchenId, dishId, usages }
}
