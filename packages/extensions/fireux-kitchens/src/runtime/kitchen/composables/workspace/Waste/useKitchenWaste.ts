import { computed } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  KitchenWasteEventDefaults,
  KitchenWasteEventStorage,
  normalizeKitchenWasteEvent,
  type KitchenWasteEvent,
  type KitchenWasteReason,
  type KitchenWasteSource,
} from '../../../utils/waste-event'

export type KitchenWasteDraft = {
  item_name: string
  quantity: number
  unit: string
  reason: KitchenWasteReason
  source: KitchenWasteSource
  notes?: string
}

const text = (value: unknown) => String(value ?? '').trim()

export function useKitchenWaste() {
  const { hasIdentity } = useAuth()
  const workspace = useKitchenWorkspace()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const { createDocument: create } = useFirestoreCreate()
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const canWrite = computed(() => Boolean(workspace.data.value))
  const collectionPath = computed(() =>
    hasIdentity.value && kitchenId.value && rootCollection.value
      ? `${rootCollection.value}/${kitchenId.value}/${KitchenWasteEventStorage.collection}`
      : ''
  )
  const { firestoreFetchCollection } = useFirestoreRead({
    databaseId: computed(() => readRuntimeFirestoreDatabaseId() || ''),
  })
  const collection =
    firestoreFetchCollection<Record<string, unknown>>(collectionPath)
  const events = computed(() =>
    (collection.value || []).map(normalizeKitchenWasteEvent)
  )

  async function recordWaste(draft: KitchenWasteDraft) {
    requireWritableData()
    const resolvedKitchenId = text(kitchenId.value)
    const resolvedCollectionPath = text(collectionPath.value)
    const itemName = text(draft.item_name)
    const unit = text(draft.unit)
    const quantity = Number(draft.quantity)
    if (!resolvedKitchenId || !resolvedCollectionPath) {
      throw new Error('Select a writable Kitchen first.')
    }
    if (!itemName) throw new Error('Wasted item is required.')
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Waste quantity must be greater than zero.')
    }
    if (!unit) throw new Error('Waste unit is required.')

    const payload: KitchenWasteEvent = {
      ...KitchenWasteEventDefaults,
      kitchen_id: resolvedKitchenId,
      item_name: itemName,
      quantity,
      unit,
      reason: draft.reason,
      source: draft.source,
      occurred_at: serverTimestamp() as never,
      notes: text(draft.notes),
    }
    return create(resolvedCollectionPath, payload, { app: true, creator: true })
  }

  return {
    kitchenId,
    canWrite,
    collectionPath,
    events,
    outcome: collection.outcome,
    error: collection.error,
    recordWaste,
  }
}
