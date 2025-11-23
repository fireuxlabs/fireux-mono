import { computed, ref } from 'vue'
import { useFirestore, useCollection, useDocument } from 'vuefire'
import { collection, query, orderBy, doc } from 'firebase/firestore'
import { useIngredientCreate } from './useIngredientCreate'
import { normalizeIngredient } from '../../../../models/objects/Ingredient.model'

// Simple firestore collection fetch - just ingredients
export function useIngredient() {
  try {
    const db = useFirestore()
    if (!db) {
      // Fallback if firestore is not available (SSR)
      return {
        all: ref([]),
        getById: (id: string) => ref(null),
        ...useIngredientCreate(),
      }
    }

    const colRef = collection(db, 'ingredients')
    const q = query(colRef, orderBy('name'))

    const { data, pending, error } = useCollection(q, { ssrKey: 'ingredients' })

    // Transform raw firestore data to normalized ingredient format
    const all = computed(() => {
      if (!data.value || pending.value || error.value) return []
      return data.value.map((raw: any) =>
        normalizeIngredient(raw.id || 'unknown', raw)
      )
    })

    // Get single ingredient by ID
    const getById = (id: string) => {
      const docRef = doc(db, 'ingredients', id)
      const { data: rawData } = useDocument(docRef, {
        ssrKey: `ingredient-${id}`,
      })

      return computed(() => {
        if (!rawData.value) return null
        return normalizeIngredient(id, rawData.value)
      })
    }

    const create = useIngredientCreate()

    return {
      all,
      pending,
      error,
      getById,
      ...create,
    }
  } catch (err) {
    console.warn('useIngredient error:', err)
    return {
      all: ref([]),
      pending: ref(false),
      error: ref(err),
      getById: (id: string) => ref(null),
      ...useIngredientCreate(),
    }
  }
}
