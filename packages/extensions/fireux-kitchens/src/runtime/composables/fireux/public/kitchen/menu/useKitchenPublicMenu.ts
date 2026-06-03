import { computed } from 'vue'
import { useRoute } from '#imports'
import { useKitchenCollection } from '../../../firestore/kitchen/useKitchen'
import { useMenuCollection } from '../../../firestore/menu/useMenu'
import type { Menu } from '../../../../../models/menu.model'

const text = (value: unknown) => String(value ?? '').trim()
const key = (value: unknown) => text(value).toLowerCase()

export function useKitchenPublicMenu() {
  const route = useRoute()
  const kitchenSlug = computed(() => text(route.params.slug))
  const menuId = computed(() => text(route.params.menuId))
  const { kitchens, pending: kitchensPending } = useKitchenCollection()
  const kitchen = computed(
    () => kitchens.value.find((item) => key(item.slug) === key(kitchenSlug.value)) ?? null
  )
  const kitchenId = computed(() => text(kitchen.value?.id))
  const menuRead = useMenuCollection(kitchenId)
  const menus = computed(() =>
    menuRead.menus.value.filter((menu) => text(menu.status) === 'published')
  )
  const menu = computed(
    () => menus.value.find((item) => text(item.id) === menuId.value) ?? null
  )
  const pending = computed(
    () => kitchensPending.value || (Boolean(kitchenId.value) && menuRead.pending.value)
  )
  const menuLink = (id: Menu['id']) =>
    `/kitchens/${encodeURIComponent(kitchenSlug.value)}/menus/${encodeURIComponent(text(id))}`

  return {
    kitchenSlug,
    kitchen,
    menus,
    menu,
    pending,
    menuLink,
  }
}
