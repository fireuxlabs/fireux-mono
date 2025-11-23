import { computed } from 'vue'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { useRecipeCreate } from './useRecipeCreate'
import { useRecipeUpdate } from './useRecipeUpdate'
import { useRecipeDelete } from './useRecipeDelete'

export function useRecipes() {
  const db = useFirestore()
  const colRef = collection(db, 'recipes')
  const q = query(colRef, orderBy('name'))
  const { data } = useCollection(q)

  // Transform raw firestore data to proper recipe format
  const all = computed(() => {
    if (!data.value) return []
    return data.value.map((raw: any) => ({
      id: raw.id || 'unknown',
      name: raw.name || 'Untitled Recipe',
      ...raw,
    }))
  })

  const create = useRecipeCreate()
  const update = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()

  return { all, ...create, ...update, ...deleteRecipe }
}
