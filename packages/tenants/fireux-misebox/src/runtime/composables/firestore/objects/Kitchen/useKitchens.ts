import { computed } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/useFirestoreManager.ts'
import type { Kitchen, KitchenCard } from '../../../../models/Kitchen.model'

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

function toCell(kitchen: Kitchen): KitchenCard.Cell {
  return {
    id: kitchen.id,
    name: kitchen.name,
    app_id: kitchen.app_id ?? null,
  }
}

// Unified Firestore-backed kitchens collection helpers
export function useKitchens() {
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const rawCollection =
    firestoreFetchCollection<KitchenFirestoreDoc>(COLLECTION_PATH)

  const kitchens = computed<Kitchen[]>(() => {
    const values = rawCollection.value ?? []
    return values
      .map((entry) => mapKitchen(entry))
      .filter((entry): entry is Kitchen => entry !== null)
  })

  const kitchenCells = computed<KitchenCard.Cell[]>(() =>
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
