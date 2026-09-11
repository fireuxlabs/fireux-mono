import { effectScope, ref, watch, type Ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { MenuItem } from '../../../menu/utils/menu-item.ts'
import type { MenuSection } from '../../../menu/utils/menu-section.ts'

const text = (value: unknown) => String(value ?? '').trim()
const isActive = (item: MenuItem) => text(item.status) !== 'archived'
const sortItems = (items: MenuItem[]) =>
  [...items].sort(
    (a, b) =>
      Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
      text(a.dish_id).localeCompare(text(b.dish_id))
  )

export function useKitchenMenuItems(
  sectionCollectionPath: Ref<string>,
  sections: Ref<MenuSection[]>
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const items = ref<MenuItem[]>([])
  const pending = ref(false)
  const error = ref<unknown>()
  watch(
    () => ({
      path: sectionCollectionPath.value,
      ids: sections.value.map((section) => text(section.id)).filter(Boolean),
    }),
    ({ path, ids }, _previous, onCleanup) => {
      items.value = []
      error.value = undefined
      pending.value = Boolean(path && ids.length)
      if (!path || !ids.length) return
      const scope = effectScope()
      onCleanup(() => scope.stop())
      scope.run(() => {
        const bindings = ids.map((id) =>
          firestoreFetchCollection<MenuItem>(`${path}/${id}/items`)
        )
        watch(
          () =>
            bindings.map((binding) => ({
              items: binding.value,
              pending: binding.pending.value,
              error: binding.error.value,
            })),
          (states) => {
            pending.value = states.some((state) => state.pending)
            error.value = states.find((state) => state.error)?.error
            items.value = error.value
              ? []
              : sortItems(
                  states.flatMap((state) => state.items || []).filter(isActive)
                )
          },
          { immediate: true, deep: true }
        )
      })
    },
    { immediate: true, deep: true }
  )
  return { items, pending, error }
}
