import { collection, getDocs } from 'firebase/firestore'
import { ref, watch, type Ref } from 'vue'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { MenuItem } from '../../../../../models/menu/menu-item.model'
import type { MenuSection } from '../../../../../models/menu/menu-section.model'

const text = (value: unknown) => String(value ?? '').trim()
const isActive = (item: MenuItem) => text(item.status) !== 'archived'
const sortItems = (items: MenuItem[]) =>
  [...items].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      text(a.dish_id).localeCompare(text(b.dish_id))
  )

export function useKitchenPublicMenuItems(
  sectionCollectionPath: Ref<string>,
  sections: Ref<MenuSection[]>
) {
  const resolveDb = useFirestoreResolver()
  const items = ref<MenuItem[]>([])
  const pending = ref(false)
  let requestId = 0

  watch(
    () => ({
      sectionCollectionPath: sectionCollectionPath.value,
      sectionIds: sections.value.map((section) => text(section.id)),
    }),
    async ({
      sectionCollectionPath,
      sectionIds,
    }: {
      sectionCollectionPath: string
      sectionIds: string[]
    }) => {
      const currentRequestId = ++requestId
      const ids = sectionIds.filter(Boolean)

      if (!sectionCollectionPath || !ids.length || import.meta.server) {
        items.value = []
        pending.value = false
        return
      }

      pending.value = true

      try {
        const snapshots = await Promise.all(
          ids.map((sectionId: string) =>
            getDocs(
              collection(resolveDb(), `${sectionCollectionPath}/${sectionId}/items`)
            )
          )
        )

        if (currentRequestId !== requestId) return

        items.value = sortItems(
          snapshots
            .flatMap((snapshot) =>
              snapshot.docs.map((doc: { id: string; data: () => unknown }) => ({
                ...(doc.data() as MenuItem),
                id: doc.id,
              }))
            )
            .filter(isActive)
        )
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useKitchenPublicMenuItems] read failed', error)
        }
        if (currentRequestId === requestId) items.value = []
      } finally {
        if (currentRequestId === requestId) pending.value = false
      }
    },
    { immediate: true, deep: true }
  )

  return {
    items,
    pending,
  }
}
