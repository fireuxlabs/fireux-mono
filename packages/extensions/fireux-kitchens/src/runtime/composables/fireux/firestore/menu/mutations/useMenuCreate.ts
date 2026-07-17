import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { computed, unref, type Ref } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import {
  MenuStorage,
  MenuModel,
  type Menu,
} from '../../../../../models/kitchen/menu/kitchen-menu.model'
import { useKitchenConsoleSelection } from '../../../console/kitchen/core/useKitchenConsoleSelection'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { useKitchenConsole } from '../../../console/kitchen/core/useKitchenConsole'
import { readKitchenCurrencyCode } from '../../../../../utils/kitchen-spine'

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
  ordering?: Menu['ordering']
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

function buildMenuPayload(
  input: MenuCreateInput,
  name: string
): Partial<Menu> {
  const kitchenId = normalizeString(input.kitchenId)
  const orderTypes = Array.isArray(input.ordering?.order_types)
    ? input.ordering.order_types
    : []
  const serviceHours = input.ordering?.service_hours || {
    inherit_kitchen_operation_hours: true,
  }

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
    ordering: input.ordering
      ? {
          enabled: input.ordering.enabled === true,
          order_types: orderTypes,
          service_hours: serviceHours,
        }
      : {
          enabled: false,
          order_types: [],
          service_hours: serviceHours,
        },
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
  const kitchenConsole = useKitchenConsole()

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
      `${kitchenCollectionPath.value}/${kitchenId}/${MenuStorage.scopeCollection}`

    if (!name) throw new Error('Menu name is required')
    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!readKitchenCurrencyCode(kitchenConsole.selection.kitchen.value)) {
      throw new Error('Select a kitchen currency code before creating menus.')
    }

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
