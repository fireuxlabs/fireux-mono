import { computed, type Ref } from 'vue'
import type { Menu } from '../../../../../../models/menu.model'
import { useMenuInterface } from './useMenuInterface'

export function useMenuComputed(
  menu: Ref<Menu | null | undefined>,
  pending: Ref<boolean>
) {
  const { pill: menuInterface } = useMenuInterface()

  const isPending = computed(() => Boolean(pending.value))
  const menuCard = computed(() => (menu.value ? menuInterface(menu.value) : null))
  const menuSearchText = computed(() =>
    menuCard.value ? JSON.stringify(menuCard.value).toLowerCase() : ''
  )

  return { isPending, menuCard, menuSearchText }
}
