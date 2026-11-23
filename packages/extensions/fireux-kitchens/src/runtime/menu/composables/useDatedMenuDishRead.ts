import { computed, type Ref } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenItemRead } from '../../kitchen/composables/items/useKitchenItemRead'
import type { Menu } from '../models/menu.model'
import { publishedMenuDates } from '../utils/calendar/daily'
import { useMenuSectionCollection } from './useMenuSectionCollection'
import { useMenuEntryCollection } from './useMenuEntryCollection'

/** Read the first linked dish on an explicitly published menu date. */
export function useDatedMenuDishRead(
  kitchenId: Readonly<Ref<string>>,
  menu: Readonly<Ref<Menu>>,
  date: Readonly<Ref<string>>
) {
  const released = computed(
    () =>
      menu.value.status === 'published' &&
      publishedMenuDates(menu.value.published_dates).includes(date.value)
  )
  const menuId = computed(() => (released.value ? menu.value.id : ''))
  const options = {
    kitchenCollectionPath: 'kitchens',
    databaseId: readRuntimeFirestoreDatabaseId(),
  }
  const sections = useMenuSectionCollection(kitchenId, menuId, options)
  const sectionId = computed(() =>
    sections.outcome.value === 'ready'
      ? sections.sections.value.find((section) => section.date === date.value)
          ?.id || ''
      : ''
  )
  const links = useMenuEntryCollection(
    kitchenId,
    menuId,
    sectionId,
    options
  )
  const itemId = computed(() =>
    sectionId.value && links.outcome.value === 'ready'
      ? links.items.value.find((link) => link.item_id)?.item_id || ''
      : ''
  )
  const dish = useKitchenItemRead(kitchenId, itemId)
  const pending = (outcome: string) =>
    outcome === 'idle' || outcome === 'pending'
  const status = computed(() => {
    if (!released.value) return 'empty'
    if (!kitchenId.value) return 'unavailable'
    if (pending(sections.outcome.value)) return 'loading'
    if (!sectionId.value) return 'unavailable'
    if (pending(links.outcome.value)) return 'loading'
    if (!itemId.value) return 'unavailable'
    if (pending(dish.outcome.value)) return 'loading'
    return dish.outcome.value === 'ready' && dish.item.value?.name
      ? 'ready'
      : 'unavailable'
  })
  return { status, item: dish.item }
}
