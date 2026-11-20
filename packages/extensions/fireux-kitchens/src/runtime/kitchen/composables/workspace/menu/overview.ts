import { computed } from 'vue'
import { useState } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { readKitchenThemePalette } from '../../../utils/kitchen-readers'
import { requireMenuWorkspace } from './state'

export type MenuListStatus = 'all' | 'published' | 'draft' | 'archived'
const menuListStatusOptions = [
  { label: 'All menus', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Archived', value: 'archived' },
] satisfies Array<{ label: string; value: MenuListStatus }>
type MenuListChoices = { query: string; status: MenuListStatus }

/** List choices survive editor navigation, isolated by App, account and Kitchen. */
function useMenuList({
  rawMenus: menus,
  activeKitchenAppId,
  kitchenId,
}: ReturnType<typeof requireMenuWorkspace>['menus']) {
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
        status: 'all' as MenuListStatus,
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
  const status = computed({
    get: () => current.value.status || 'all',
    set: (status: MenuListStatus) => {
      choices.value = {
        ...choices.value,
        [scope.value]: { ...current.value, status },
      }
    },
  })
  const totalCount = computed(() => menus.value.length)
  const filteredMenus = computed(() =>
    menus.value
      .filter((menu) =>
        status.value === 'all'
          ? menu.status !== 'archived'
          : (menu.status || 'draft') === status.value
      )
      .filter((menu) =>
        `${menu.internal_name || ''} ${menu.name || ''} ${menu.description || ''}`
          .toLocaleLowerCase()
          .includes(query.value.trim().toLocaleLowerCase())
      )
  )
  const visibleMenus = computed(() =>
    filteredMenus.value
      .slice()
      .sort(
        (a, b) =>
          Number(b.status === 'published') - Number(a.status === 'published') ||
          Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
          a.name.localeCompare(b.name)
      )
  )
  return {
    query,
    status,
    statusOptions: menuListStatusOptions,
    totalCount,
    visibleMenus,
  }
}

export function useKitchenWorkspaceMenuOverview() {
  const { menus, overview } = requireMenuWorkspace()
  const list = useMenuList(menus)
  const canCreateMenu = computed(
    () => menus.derived.value.capability.primitives.create.available
  )
  return {
    ...list,
    palette: computed(() =>
      readKitchenThemePalette(menus.selectedKitchen.value)
    ),
    kitchenId: overview.storageKitchenId,
    timezone: overview.timezone,
    menusOutcome: overview.menusOutcome,
    canCreateMenu,
    createBlockedMessage: menus.menuCreateBlockedMessage,
    openCreate: menus.actions.openCreate,
  }
}
