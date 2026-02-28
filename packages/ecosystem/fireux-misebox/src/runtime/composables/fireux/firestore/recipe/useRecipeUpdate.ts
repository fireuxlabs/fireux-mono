import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useFirestore } from 'vuefire'

type RecipePatch = Record<string, unknown>

function normalizeSlug(value: unknown): string {
  return String(value ?? '').trim()
}

export function useRecipeUpdate() {
  const db = useFirestore()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function updateRecipe(
    recipeId: string,
    updates: RecipePatch
  ): Promise<boolean> {
    const id = String(recipeId || '').trim()
    if (!id) throw new Error('Recipe id required')
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid update payload')
    }

    await updateDoc(doc(db, 'recipes', id), {
      ...updates,
      updated_at: serverTimestamp(),
    })

    const slug = normalizeSlug((updates as Record<string, unknown>).slug)
    const status = String((updates as Record<string, unknown>).status ?? '').trim()
    const explicitPublic = (updates as Record<string, unknown>).isPublic
    await upsertSeoIndexDoc('seo_index_recipes', id, {
      path: `/recipes/${slug || id}`,
      isPublic:
        typeof explicitPublic === 'boolean'
          ? explicitPublic
          : status
            ? status === 'published'
            : undefined,
    })

    return true
  }

  return { updateRecipe }
}
