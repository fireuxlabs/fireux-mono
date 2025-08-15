import { computed } from 'vue'
import { useFirestore, useCollection, useDocument } from 'vuefire'
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { normalizeKitchen } from '../../../../models/objects/Kitchen.model'

// Simple CRUD for kitchens
export function useKitchens() {
  const db = useFirestore()
  const colRef = collection(db, 'kitchens')
  const q = query(colRef, orderBy('name'))
  const { data, pending, error } = useCollection(q, { ssrKey: 'kitchens' })

  // Get app ID from environment
  const appId = process.env.APP_ID || 'niederhorn'

  // All kitchens
  const all = computed(() => {
    if (!data.value) return []
    return data.value.map((raw: any) => normalizeKitchen(raw.id, raw))
  })

  // Get kitchen by ID
  const getById = (id: string) => {
    const docRef = doc(db, 'kitchens', id)
    const { data: rawData } = useDocument(docRef)
    return computed(() =>
      rawData.value ? normalizeKitchen(id, rawData.value) : null
    )
  }

  // Fetch the app's specific kitchen by ID
  const appKitchen = getById(appId)

  // Check if app has a kitchen (true if kitchen document exists)
  const hasKitchen = computed(() => !!appKitchen.value)

  // Add ingredient to kitchen
  const addIngredient = (kitchenId: string, ingredientId: string) => {
    const docRef = doc(db, 'kitchens', kitchenId)
    return updateDoc(docRef, { ingredients: arrayUnion(ingredientId) })
  }

  // Remove ingredient from kitchen
  const removeIngredient = (kitchenId: string, ingredientId: string) => {
    const docRef = doc(db, 'kitchens', kitchenId)
    return updateDoc(docRef, { ingredients: arrayRemove(ingredientId) })
  }

  return {
    all,
    getById,
    addIngredient,
    removeIngredient,
    pending,
    error,
    hasKitchen,
    appKitchen,
    appId,
  }
}
