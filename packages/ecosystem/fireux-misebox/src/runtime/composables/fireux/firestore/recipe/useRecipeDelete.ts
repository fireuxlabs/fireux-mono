import { deleteDoc, doc } from 'firebase/firestore'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

export function useRecipeDelete() {
  const db = useFirestore()
  const { deleteSeoIndexDoc } = useSeoIndexWrite()

  async function deleteRecipe(recipeId: string): Promise<boolean> {
    const id = String(recipeId || '').trim()
    if (!id) throw new Error('Recipe id required')

    await deleteDoc(doc(db, 'recipes', id))
    await deleteSeoIndexDoc('seo_index_recipes', id)
    return true
  }

  return { deleteRecipe }
}
