import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { Ref } from 'vue'
import { unref } from 'vue'
import {
  normalizeString,
  resolveKitchenChildCollectionPath,
} from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../../../models/order.model'

type KitchenOrderStage = 'accept' | 'queue' | 'pass' | 'archive'

export function useKitchenOrderStage(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()

  function ordersCollectionPath(kitchenId: string) {
    const resolvedKitchenId = normalizeString(kitchenId)
    if (!resolvedKitchenId) throw new Error('Kitchen id is required')

    return resolveKitchenChildCollectionPath({
      kitchenCollectionPath: unref(options.kitchenCollectionPath),
      kitchenId: resolvedKitchenId,
      collectionName: KitchenOrderStorage.collection,
      appId,
    })
  }

  async function stageKitchenOrder(
    kitchenId: string,
    orderId: string,
    stage: KitchenOrderStage,
    options: { estimatedMinutes?: number } = {}
  ) {
    const resolvedOrderId = normalizeString(orderId)
    if (!resolvedOrderId) throw new Error('Order id is required')

    await updateDocument<KitchenOrder>(
      ordersCollectionPath(kitchenId),
      resolvedOrderId,
      stagePatch(stage, options)
    )
  }

  return { stageKitchenOrder }
}

function stagePatch(
  stage: KitchenOrderStage,
  options: { estimatedMinutes?: number } = {}
): Partial<KitchenOrder> {
  if (stage === 'accept') {
    const estimatedMinutes = Math.max(
      1,
      Number(options.estimatedMinutes || 45) || 45
    )

    return {
      status: 'open',
      fire_state: 'held',
      estimated_ready_minutes: estimatedMinutes,
      estimated_ready_at: Timestamp.fromDate(
        new Date(Date.now() + estimatedMinutes * 60 * 1000)
      ) as any,
      updated_at: serverTimestamp() as any,
    }
  }

  if (stage === 'pass') {
    return {
      status: 'on_pass',
      fire_state: 'fired',
      updated_at: serverTimestamp() as any,
    }
  }

  if (stage === 'archive') {
    return {
      status: 'closed',
      fire_state: 'fired',
      updated_at: serverTimestamp() as any,
    }
  }

  return {
    status: 'open',
    fire_state: 'held',
    updated_at: serverTimestamp() as any,
  }
}
