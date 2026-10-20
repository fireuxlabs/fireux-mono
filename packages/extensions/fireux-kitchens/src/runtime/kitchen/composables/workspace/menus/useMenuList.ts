import { computed } from 'vue'
import { useState } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useKitchenMenusContext } from './useKitchenMenusContext'

type MenuListChoices = { query: string; showArchived: boolean }

/** List choices survive editor navigation, isolated by App, account and Kitchen. */
export function useMenuList() {
  const {
    rawMenus: menus,
    activeKitchenAppId,
    kitchenId,
  } = useKitchenMenusContext()
  const session = useAppSession()
  const choices = useState<Record<string, MenuListChoices>>(
    'kitchen-menu-list',
    () => ({})
  )
  const scope = computed(() =>
    JSON.stringify([
      activeKitchenAppId.value,
      session.uid.value,
      kitchenId.value,
    ])
  )
  const current = computed(
    () =>
      choices.value[scope.value] ?? {
        query: '',
        showArchived: false,
      }
  )
  const query = computed({
    get: () => current.value.query,
    set: (query: string) => {
      choices.value = {
        ...choices.value,
        [scope.value]: { ...current.value, query },
      }
    },
  })
  const showArchived = computed({
    get: () => current.value.showArchived,
    set: (showArchived: boolean) => {
      choices.value = {
        ...choices.value,
        [scope.value]: { ...current.value, showArchived },
      }
    },
  })
  const archivedCount = computed(
    () => menus.value.filter((menu) => menu.status === 'archived').length
  )
  const filteredMenus = computed(() =>
    menus.value
      .filter((menu) => showArchived.value || menu.status !== 'archived')
      .filter((menu) =>
        `${menu.internal_name || ''} ${menu.name || ''} ${menu.description || ''}`
          .toLocaleLowerCase()
          .includes(query.value.trim().toLocaleLowerCase())
      )
  )
  const groups = computed(() =>
    [
      {
        label: 'Menus',
        icon: 'i-lucide-book-open',
        menus: filteredMenus.value.filter(
          (menu) => menu.schedule !== 'daily' && menu.status !== 'archived'
        ),
      },
      {
        label: 'Archived',
        icon: 'i-lucide-archive',
        menus: filteredMenus.value.filter((menu) => menu.status === 'archived'),
      },
      {
        label: 'Daily specials',
        icon: 'i-lucide-calendar-days',
        menus: filteredMenus.value.filter(
          (menu) => menu.schedule === 'daily' && menu.status !== 'archived'
        ),
      },
    ].filter((group) => group.menus.length)
  )
  return { query, showArchived, archivedCount, filteredMenus, groups }
}
