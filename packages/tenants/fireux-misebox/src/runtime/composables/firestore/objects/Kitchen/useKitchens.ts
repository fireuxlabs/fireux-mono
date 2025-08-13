import { computed } from 'vue'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { useKitchenCreate } from './useKitchenCreate'
import { useKitchenUpdate } from './useKitchenUpdate'
import { useKitchenDelete } from './useKitchenDelete'

export function useKitchens() {
  const db = useFirestore()
  const colRef = collection(db, 'kitchens')
  const q = query(colRef, orderBy('name'))
  const { data } = useCollection(q)

  // Transform raw firestore data to proper kitchen format
  const all = computed(() => {
    if (!data.value) return []
    return data.value.map((raw: any) => ({
      id: raw.id || 'unknown',
      name: raw.name || 'Untitled Kitchen',
      ...raw,
    }))
  })

  const create = useKitchenCreate()
  const update = useKitchenUpdate()
  const deleteKitchen = useKitchenDelete()

  return { all, ...create, ...update, ...deleteKitchen }
}
