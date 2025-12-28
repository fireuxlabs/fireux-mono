import { computed } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import type { Kitchen } from '../../../../../models/objects/kitchen.model'
import { useKitchenInterface, type KitchenCell } from './utils/view/useKitchenInterface'

const COLLECTION_PATH = 'kitchens'

type KitchenFirestoreDoc = Partial<Kitchen> & {
  id?: string
  place_id?: string
  appId?: string | null
}

function mapKitchen(
  raw: KitchenFirestoreDoc,
  fallbackId?: string
): Kitchen | null {
  const id = raw.id || raw.place_id || fallbackId
  if (!id) return null

  const resolvedAppId = raw.app_id ?? raw.appId ?? null

  return {
    id,
    name: raw.name ?? 'Untitled kitchen',
    description: raw.description || undefined,
    app_id: resolvedAppId,
  }
}

// Unified Firestore-backed kitchens collection helpers
export function useKitchens() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const { toCell } = useKitchenInterface()

  const rawCollection =
    firestoreFetchCollection<KitchenFirestoreDoc>(COLLECTION_PATH)

  const kitchens = computed<Kitchen[]>(() => {
    const values = rawCollection.value ?? []
    return values
      .map((entry) => mapKitchen(entry))
      .filter((entry): entry is Kitchen => entry !== null)
  })

  const kitchenCells = computed<KitchenCell[]>(() =>
    kitchens.value.map((kitchen) => toCell(kitchen))
  )

  function useKitchenDoc(id: string) {
    return firestoreFetchDoc<KitchenFirestoreDoc>(COLLECTION_PATH, id)
  }

  function useKitchen(id: string) {
    const docRef = useKitchenDoc(id)
    return computed<Kitchen | null>(() => {
      const value = docRef.value
      if (value === undefined || value === null) return null
      return mapKitchen(value, id)
    })
  }

  const isLoaded = computed(() => rawCollection.value !== undefined)

  return {
    rawCollection,
    kitchens,
    kitchenCells,
    useKitchen,
    useKitchenDoc,
    isLoaded,
  }
}
