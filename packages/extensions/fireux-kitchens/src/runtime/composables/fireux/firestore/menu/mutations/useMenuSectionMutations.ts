import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { unref, type Ref } from 'vue'
import {
  MenuSectionModel,
  type MenuSection,
} from '../../../../../models/kitchen/menu/menu-section.model'
import { menuSectionsPath } from '../utils/paths'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) => clean(unref(value))

export function useMenuSectionMutations(options: Options = {}) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const { updateDocument } = useFirestoreUpdate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()

  const path = (kitchenId: string, menuId: string) =>
    menuSectionsPath({
      kitchenCollectionPath: optionPath(options.kitchenCollectionPath),
      kitchenId,
      menuId,
      appId,
    })

  const createSection = async (input: {
    kitchenId: string
    menuId: string
    label: string
    description?: string
    sort_order?: number
  }) => {
    requireWritableData()
    const collectionPath = path(input.kitchenId, input.menuId)
    const label = clean(input.label)
    if (!collectionPath) throw new Error('Missing menu')
    if (!label) throw new Error('Section label is required')

    return createDocument(
      collectionPath,
      {
        ...MenuSectionModel,
        kitchen_id: clean(input.kitchenId),
        menu_id: clean(input.menuId),
        label,
        description: clean(input.description),
        sort_order: Number(input.sort_order || 0),
      },
      { app: true, creator: true }
    )
  }

  const updateSection = async (
    kitchenId: string,
    menuId: string,
    sectionId: string,
    patch: Partial<MenuSection>
  ) => {
    requireWritableData()
    const collectionPath = path(kitchenId, menuId)
    const id = clean(sectionId)
    if (!collectionPath || !id) throw new Error('Missing section')
    await updateDocument<MenuSection>(collectionPath, id, patch)
  }

  const reorderSections = async (
    kitchenId: string,
    menuId: string,
    orderedIds: string[]
  ) => {
    await Promise.all(
      orderedIds
        .map(clean)
        .filter(Boolean)
        .map((id, index) => updateSection(kitchenId, menuId, id, { sort_order: index }))
    )
  }

  return {
    createSection,
    updateSection,
    archiveSection: (kitchenId: string, menuId: string, sectionId: string) =>
      updateSection(kitchenId, menuId, sectionId, { status: 'archived' }),
    reorderSections,
  }
}
