// Concurrent edit — 2026-07-22 13:15 CEST — Demo World pass: resolve Demo Menu sections from the same local scenario as the Menu list.
// Concurrent edit — 2026-07-22 14:08 CEST — Demo route integrity: do not project sections for an unresolved Menu detail route.
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { computed } from 'vue'
import type { KitchenMenu as Menu } from '../../../../../menu/models/kitchen-menu.model.ts'
import type { MenuItemPriceOption } from '../../../../../menu/models/menu-item.model.ts'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'
import { useMenuSectionCollection } from '../../../../../menu/composables/firestore/fetch/useMenuSectionCollection'
import { useMenuSectionMutations } from '../../../../../menu/composables/firestore/mutations/useMenuSectionMutations'
import {
  findKitchenWorkspaceDemoMenu,
  findKitchenWorkspaceDemoScenario,
  useKitchenWorkspaceDemoData,
} from '../../core/useKitchenWorkspaceDemoData'

const clean = (value: unknown) => String(value ?? '').trim()

export type KitchenWorkspaceMenuPreviewItem = {
  id: string
  name: string
  imageUrl: string
  price: number
  priceOptions: MenuItemPriceOption[]
}

export type KitchenWorkspaceMenuSectionPreview = {
  id: string
  label: string
  description: string
  itemCount: number | null
  items: KitchenWorkspaceMenuPreviewItem[]
}

export function useKitchenWorkspaceMenu() {
  const state = useKitchenWorkspaceMenus()
  const menuId = useRouteParam('menuId')
  const menu = computed<Menu | null>(
    () =>
      state.menus.value.find((item) => clean(item.id) === menuId.value) ?? null
  )
  const source = computed(
    () =>
      state.menuSources.value.find((item) => clean(item.id) === menuId.value) ??
      null
  )
  const demoData = useKitchenWorkspaceDemoData(state.isDemo)
  const demoScenario = computed(() =>
    findKitchenWorkspaceDemoScenario(demoData.data.value, state.kitchenId.value)
  )
  const demoMenu = computed(() =>
    findKitchenWorkspaceDemoMenu(demoScenario.value, menuId.value)
  )
  const sectionMenuId = computed(() => (menu.value ? menuId.value : ''))
  const sectionState = useMenuSectionCollection(
    state.storageKitchenId,
    sectionMenuId,
    {
      kitchenCollectionPath: state.rootCollection,
      databaseId: state.databaseId,
    }
  )
  const sectionMutations = useMenuSectionMutations({
    kitchenCollectionPath: state.rootCollection,
    databaseId: state.databaseId,
  })
  const sections = computed(() =>
    state.isDemo.value
      ? menu.value && clean(menu.value.id) === menuId.value
        ? (demoMenu.value?.menuSections.map((entry) => entry.section) ?? [])
        : []
      : sectionState.sections.value
  )
  const sectionsPending = computed(() =>
    state.isDemo.value ? demoData.pending.value : sectionState.pending.value
  )
  const sectionsCollectionPath = computed(() =>
    state.isDemo.value
      ? `demo/kitchens/${state.kitchenId.value}/menus/${menuId.value}/sections`
      : sectionState.collectionPath.value
  )
  const sectionPreviews = computed<KitchenWorkspaceMenuSectionPreview[]>(() =>
    [...sections.value]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((section) => {
        const demoSection = demoMenu.value?.menuSections.find(
          (entry) => clean(entry.section.id) === clean(section.id)
        )
        const activeItems =
          demoSection?.items
            .filter((item) => item.status === 'active')
            .sort((left, right) => left.sort_order - right.sort_order) ?? []

        return {
          id: clean(section.id),
          label: clean(section.label) || clean(section.id) || 'Section',
          description: clean(section.description),
          itemCount: demoSection ? activeItems.length : null,
          items: activeItems.map((item) => {
            const dish = demoMenu.value?.dishes.find(
              (candidate) => clean(candidate.id) === clean(item.dish_id)
            )

            return {
              id: clean(item.id),
              name: clean(dish?.name) || clean(item.dish_id) || 'Menu item',
              imageUrl: clean(dish?.image),
              price: Number.isFinite(Number(item.price))
                ? Number(item.price)
                : 0,
              priceOptions: [...(item.price_options ?? [])],
            }
          }),
        }
      })
  )

  function assertCanWrite() {
    if (!state.canWrite.value) throw new Error('This menu is read-only.')
  }

  async function createSection(
    ...args: Parameters<typeof sectionMutations.createSection>
  ) {
    assertCanWrite()
    return sectionMutations.createSection(...args)
  }

  async function updateSection(
    ...args: Parameters<typeof sectionMutations.updateSection>
  ) {
    assertCanWrite()
    return sectionMutations.updateSection(...args)
  }

  async function archiveSection(
    ...args: Parameters<typeof sectionMutations.archiveSection>
  ) {
    assertCanWrite()
    return sectionMutations.archiveSection(...args)
  }

  async function reorderSections(
    ...args: Parameters<typeof sectionMutations.reorderSections>
  ) {
    assertCanWrite()
    return sectionMutations.reorderSections(...args)
  }

  return {
    ...state,
    createSection,
    updateSection,
    archiveSection,
    reorderSections,
    menuId,
    menu,
    source,
    sections,
    sectionPreviews,
    sectionsPending,
    sectionsCollectionPath,
    debug: computed(() => ({
      ...state.debug.value,
      menuId: menuId.value,
      hasMenu: Boolean(menu.value),
      hasSource: Boolean(source.value),
      sectionsCount: sections.value.length,
    })),
  }
}
