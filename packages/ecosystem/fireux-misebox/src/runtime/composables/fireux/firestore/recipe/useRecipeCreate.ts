import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { ref } from 'vue'
import { useCurrentUser, useFirestore } from 'vuefire'

function toSlug(value: string): string {
  const base = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'recipe'
}

export function useRecipeCreate() {
  const currentUser = useCurrentUser()
  const db = useFirestore()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const creating = ref(false)
  const createError = ref<Error | null>(null)

  async function createRecipe(name: string): Promise<string> {
    if (!name) throw new Error('Recipe name required')
    if (!currentUser.value) throw new Error('User not authenticated')

    creating.value = true
    createError.value = null

    try {
      const slug = `${toSlug(name)}-${Date.now().toString(36)}`
      const data = {
        name: name.trim(),
        title: name.trim(),
        slug,
        status: 'published',
        created_at: serverTimestamp(),
        creator_id: currentUser.value.uid,
      }

      const docRef = await addDoc(collection(db, 'recipes'), data)
      await upsertSeoIndexDoc('seo_index_recipes', docRef.id, {
        path: `/recipes/${slug}`,
        isPublic: true,
      })
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
