import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { computed, unref, type Ref } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  MenuStorage,
  MenuModel,
  type Menu,
} from '../../../../../models/menu/menu.model'
import { useKitchenConsoleSelection } from '../../../console/kitchen/core/useKitchenConsoleSelection'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'

export type MenuCreateInput = {
  kitchenId?: string
  id?: string
  name: string
  description?: string
  status?: Menu['status']
  doc_url?: string
  doc_name?: string
  doc_type?: string
  doc_storage_path?: string
  ordering_enabled?: boolean
  ordering_modes?: Menu['ordering_modes']
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function buildMenuPayload(
  input: MenuCreateInput,
  name: string
): Partial<Menu> {
  const kitchenId = normalizeString(input.kitchenId)

  return {
    ...MenuModel,
    kitchen_id: kitchenId,
    name,
    description: normalizeString(input.description),
    status: input.status || 'draft',
    doc_url: normalizeString(input.doc_url),
    doc_name: normalizeString(input.doc_name),
    doc_type: normalizeString(input.doc_type),
    doc_storage_path: normalizeString(input.doc_storage_path),
    ordering_enabled: input.ordering_enabled === true,
    ordering_modes: Array.isArray(input.ordering_modes) ? input.ordering_modes : [],
  }
}

export function useMenuCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    kitchenId?: string | Ref<string | null | undefined>
    useSelectedKitchen?: boolean
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { createDocument, createDocumentWithId } = useFirestoreCreate({
    databaseId: options.databaseId,
  })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleSelection()

  const kitchenCollectionPath = computed(() =>
    normalizeString(unref(options.kitchenCollectionPath)) ||
    resolveKitchenScopeCollectionPath(appId)
  )
  const defaultKitchenId = computed(() =>
    normalizeString(unref(options.kitchenId)) ||
    (options.useSelectedKitchen ? normalizeString(selectedId.value) : '')
  )

  async function createMenu(input: MenuCreateInput): Promise<{ created: boolean; id: string }> {
    const kitchenId = normalizeString(input.kitchenId || defaultKitchenId.value)
    const name = normalizeString(input.name)
    const menuId = normalizeSlug(input.id || name)
    const collectionPath =
      `${kitchenCollectionPath.value}/${kitchenId}/${MenuStorage.collection}`

    if (!name) throw new Error('Menu name is required')
    if (!kitchenId) throw new Error('Kitchen id is required')

    const payload = buildMenuPayload({ ...input, kitchenId }, name)
    const id = menuId
      ? await createDocumentWithId<Partial<Menu>>(
          collectionPath,
          menuId,
          payload,
          { app: true, creator: true }
        )
      : await createDocument<Partial<Menu>>(
          collectionPath,
          payload,
          { app: true, creator: true }
        )

    return { created: true, id }
  }

  return { createMenu }
}
