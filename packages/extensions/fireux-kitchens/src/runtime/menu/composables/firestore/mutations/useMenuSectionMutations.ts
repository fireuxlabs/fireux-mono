import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { unref, type Ref } from 'vue'
import {
  MenuSectionModel,
  type MenuSection,
} from '../../../models/menu-section.model.ts'
import { menuSectionsPath } from '../utils/paths'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) =>
  clean(unref(value))

export function useMenuSectionMutations(options: Options = {}) {
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
  const { updateDocument } = useFirestoreUpdate({
    databaseId: options.databaseId,
  })
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

    return create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-menu-sections',
        collectionPath
      ),
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
    const immutable = ['id', 'kitchen_id', 'menu_id', 'created']
    if (immutable.some((key) => Object.hasOwn(patch, key))) {
      throw new Error(
        'Menu Section identity and relationships cannot be changed.'
      )
    }
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
        .map((id, index) =>
          updateSection(kitchenId, menuId, id, { sort_order: index })
        )
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
