import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { computed, unref, type Ref } from 'vue'
import {
  MenuStorage,
  MenuModel,
  type Menu,
} from '../../../../../models/menu.model'
import { useKitchenSelection } from '../../../console/kitchen/useKitchenSelection'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

export type MenuCreateShape = 'root' | 'scoped'

export type MenuCreateInput = {
  kitchenId?: string
  name: string
  description?: string
  source_language?: string
  status?: Menu['status']
  doc_url?: string
  doc_name?: string
  doc_type?: string
  doc_storage_path?: string
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
    source_language: normalizeString(input.source_language) || 'en',
    status: input.status || 'draft',
    doc_url: normalizeString(input.doc_url),
    doc_name: normalizeString(input.doc_name),
    doc_type: normalizeString(input.doc_type),
    doc_storage_path: normalizeString(input.doc_storage_path),
  }
}

export function useMenuCreate(
  options: {
    shape?: MenuCreateShape
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    kitchenId?: string | Ref<string | null | undefined>
    useSelectedKitchen?: boolean
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    normalizeString(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )
  const defaultKitchenId = computed(() =>
    normalizeString(unref(options.kitchenId)) ||
    (options.useSelectedKitchen ? normalizeString(selectedId.value) : '')
  )

  async function createMenu(input: MenuCreateInput): Promise<{ created: boolean; id: string }> {
    const kitchenId = normalizeString(input.kitchenId || defaultKitchenId.value)
    const name = normalizeString(input.name)
    const shape: MenuCreateShape =
      options.shape || (kitchenId ? 'scoped' : 'root')

    if (!name) throw new Error('Menu name is required')
    if (shape === 'scoped' && !kitchenId) throw new Error('Kitchen id is required')

    const id = await createDocument<Partial<Menu>>(
      shape === 'scoped'
        ? `${kitchenCollectionPath.value}/${kitchenId}/${MenuStorage.collection}`
        : MenuStorage.rootCollection,
      buildMenuPayload({ ...input, kitchenId }, name),
      { app: true, creator: true }
    )

    return { created: true, id }
  }

  return { createMenu }
}
