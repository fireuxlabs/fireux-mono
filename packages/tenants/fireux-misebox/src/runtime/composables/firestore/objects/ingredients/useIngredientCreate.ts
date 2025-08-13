import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFirestoreManager } from 'fireux-core/composables/firestore/useFirestoreManager'

// Minimal, isolated ingredient create composable (tenant scoped)
// Keeps logic simple and independent from generic object/profile systems
export function useIngredientCreate() {
  const currentUser = useCurrentUser()
  const { setDocument } = useFirestoreManager()

  const creating = ref(false)
  const createError = ref<Error | null>(null)

  // Accept just a name for now; can extend later with category, unit, etc.
  async function createIngredient(name: string): Promise<string> {
    if (!name) throw new Error('Ingredient name required')
    if (!currentUser.value) throw new Error('User not authenticated')

    creating.value = true
    createError.value = null

    try {
      // Use timestamp + random segment for id (simple, avoids slug logic for now)
      const id = `ing_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 7)}`

      const data = {
        name: name.trim(),
        // creator_id & created_at will be added by setDocument(stampDoc)
        // updated_at omitted for now (can add in update flow later)
      }

      await setDocument('ingredients', id, data)
      return id
    } catch (e: any) {
      createError.value =
        e instanceof Error
          ? e
          : new Error(e?.message || 'Failed to create ingredient')
      throw createError.value
    } finally {
      creating.value = false
    }
  }

  return { createIngredient, creating, createError }
}
