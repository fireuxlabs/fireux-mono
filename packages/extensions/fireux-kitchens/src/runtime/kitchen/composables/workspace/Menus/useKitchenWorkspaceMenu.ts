import { computed } from 'vue'
import type { MenuItemPriceOption } from '../../../../menu/utils/menu-item.ts'
import { useKitchenWorkspaceMenuRecord } from './useKitchenWorkspaceMenuRecord'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
import { useMenuSectionMutations } from '../../../../menu/composables/firestore/mutations/useMenuSectionMutations'

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
  const state = useKitchenWorkspaceMenuRecord()
  const { menu, menuId, menuSlug } = state
  const source = computed(
    () =>
      state.menuSources.value.find((item) => clean(item.id) === menuId.value) ??
      null
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
  const sections = sectionState.sections
  const sectionsPending = sectionState.pending
  const sectionsCollectionPath = sectionState.collectionPath
  const sectionPreviews = computed<KitchenWorkspaceMenuSectionPreview[]>(() =>
    [...sections.value]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((section) => {
        return {
          id: clean(section.id),
          label: clean(section.label) || clean(section.id) || 'Section',
          description: clean(section.description),
          itemCount: null,
          items: [],
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
    menuSlug,
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
