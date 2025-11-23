import { ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export function useRecipeCreate() {
  const currentUser = useCurrentUser()
  const db = useFirestore()
  const creating = ref(false)
  const createError = ref<Error | null>(null)

  async function createRecipe(name: string): Promise<string> {
    if (!name) throw new Error('Recipe name required')
    if (!currentUser.value) throw new Error('User not authenticated')

    creating.value = true
    createError.value = null

    try {
      const data = {
        name: name.trim(),
        created_at: serverTimestamp(),
        creator_id: currentUser.value.uid,
      }

      const docRef = await addDoc(collection(db, 'recipes'), data)
      return docRef.id
    } catch (e: any) {
      createError.value =
        e instanceof Error
          ? e
          : new Error(e?.message || 'Failed to create recipe')
      throw createError.value
    } finally {
      creating.value = false
    }
  }

  return { createRecipe, creating, createError }
}
