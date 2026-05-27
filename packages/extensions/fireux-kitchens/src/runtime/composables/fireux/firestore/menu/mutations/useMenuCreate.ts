import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { computed, unref, type Ref } from 'vue'
import { MenuModel, type Menu, type MenuServiceMode } from '../../../../../models/menu.model'
import { useKitchenSelection } from '../../../console/kitchen/useKitchenSelection'
import { resolveKitchenConsoleCollectionPath } from '../../../console/kitchen/operations/collections/useKitchenChildCollection'

export type MenuCreateForm = {
  kitchenId?: string
  name: string
  description?: string
  service_modes?: MenuServiceMode[]
  sort_order?: number
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useMenuCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenSelection()

  const kitchenCollectionPath = computed(() =>
    clean(unref(options.kitchenCollectionPath)) ||
    resolveKitchenConsoleCollectionPath(appId)
  )

  async function createMenu(input: MenuCreateForm): Promise<{ created: boolean; id: string }> {
    const kitchenId = clean(input.kitchenId || selectedId.value)
    const name = clean(input.name)

    if (!kitchenId) throw new Error('Kitchen id is required')
    if (!name) throw new Error('Menu name is required')

    const id = await createDocument<Partial<Menu>>(
      `${kitchenCollectionPath.value}/${kitchenId}/menus`,
      {
        ...MenuModel,
        kitchen_id: kitchenId,
        name,
        description: clean(input.description),
        service_modes: input.service_modes?.length ? input.service_modes : ['dine_in'],
        sort_order: Number(input.sort_order || 0),
      },
      { app: true, creator: true }
    )

    return { created: true, id }
  }

  return { createMenu }
}
