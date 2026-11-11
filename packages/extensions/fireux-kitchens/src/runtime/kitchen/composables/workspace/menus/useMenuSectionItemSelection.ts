import { computed, ref, watch } from 'vue'
import type { useMenuSection } from '../../../../menu/composables/useMenuSection'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'

/** Select existing Items without acquiring another catalogue or command owner. */
export function useMenuSectionItemSelection(
  context: Pick<
    ReturnType<typeof useMenuSection>,
    | 'kitchenId'
    | 'menuId'
    | 'sectionId'
    | 'dishSource'
    | 'itemsOutcome'
    | 'itemsError'
    | 'activeItemRows'
    | 'canWrite'
    | 'createItem'
  >
) {
  const {
    kitchenId,
    menuId,
    sectionId,
    dishSource,
    activeItemRows,
    itemsOutcome,
    itemsError,
    canWrite,
    createItem,
  } = context
  const query = ref('')
  const selected = ref<string[]>([])
  const busy = ref(false)
  const error = ref('')
  const added = ref<string[]>([])
  watch(
    activeItemRows,
    (rows) => {
      const acknowledged = new Set(rows.map((row) => row.dishId))
      added.value = added.value.filter((id) => !acknowledged.has(id))
    },
    { flush: 'sync' }
  )
  const catalogueReady = computed(() =>
    ['ready', 'empty'].includes(dishSource.outcome.value)
  )
  const placed = computed(
    () =>
      new Set([
        ...activeItemRows.value.map((row) => row.dishId),
        ...added.value,
      ])
  )
  const available = computed(() =>
    dishSource.dishes.value.filter((dish) => !placed.value.has(dish.id))
  )
  const visible = computed(() =>
    available.value
      .filter((dish) =>
        `${dish.name} ${dish.description || ''}`
          .toLocaleLowerCase()
          .includes(query.value.trim().toLocaleLowerCase())
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
  )
  const selectedIds = computed(() =>
    available.value
      .filter((dish) => selected.value.includes(dish.id))
      .map((dish) => dish.id)
  )
  const canAdd = computed(() =>
    Boolean(
      canWrite.value &&
        kitchenId.value &&
        menuId.value &&
        sectionId.value &&
        catalogueReady.value &&
        ['ready', 'empty'].includes(itemsOutcome.value) &&
        selectedIds.value.length &&
        !busy.value
    )
  )
  const captureScope = useMenuEditorScope(
    [kitchenId, menuId, sectionId, canWrite],
    () => {
      query.value = ''
      selected.value = []
      added.value = []
      busy.value = false
      error.value = ''
    }
  )
  async function add() {
    if (!canAdd.value) return
    const isCurrent = captureScope()
    const target = {
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      sectionId: sectionId.value,
    }
    const ids = [...selectedIds.value]
    busy.value = true
    error.value = ''
    let count = 0
    try {
      for (const dishId of ids) {
        if (!isCurrent()) return
        if (placed.value.has(dishId)) continue
        await createItem({ ...target, dishId }, isCurrent)
        if (!isCurrent()) return
        if (!activeItemRows.value.some((row) => row.dishId === dishId))
          added.value.push(dishId)
        selected.value = selected.value.filter((id) => id !== dishId)
        count++
      }
      return count
    } catch (cause) {
      if (isCurrent())
        error.value = `${count ? `${count} added. ` : ''}${cause instanceof Error ? cause.message : 'Could not add Items.'} Your remaining selection is kept for retry.`
    } finally {
      if (isCurrent()) busy.value = false
    }
  }
  return {
    query,
    selected,
    busy,
    error,
    visible,
    selectedIds,
    canAdd,
    catalogueReady,
    catalogueOutcome: dishSource.outcome,
    catalogueError: dishSource.error,
    itemsOutcome,
    itemsError,
    add,
  }
}
