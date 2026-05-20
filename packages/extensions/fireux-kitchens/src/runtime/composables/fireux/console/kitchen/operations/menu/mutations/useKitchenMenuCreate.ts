import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { unref, type Ref } from 'vue'
import { MenuModel, type MenuServiceMode } from '../../../../../../../models/menu.model'
import { kitchenMenusPath } from '../paths'

type Options = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

const clean = (value: unknown) => String(value ?? '').trim()
const optionPath = (value: Options['kitchenCollectionPath']) => clean(unref(value))

export function useKitchenMenuCreate(options: Options = {}) {
  const { createDocument } = useFirestoreCreate({ databaseId: options.databaseId })

  const createMenu = async (input: {
    kitchenId: string
    name: string
    description?: string
    service_modes?: MenuServiceMode[]
    sort_order?: number
  }) => {
    const kitchenId = clean(input.kitchenId)
    const name = clean(input.name)
    const collectionPath = kitchenMenusPath({
      kitchenCollectionPath: optionPath(options.kitchenCollectionPath),
      kitchenId,
    })

    if (!collectionPath || !kitchenId) throw new Error('Missing kitchen')
    if (!name) throw new Error('Menu name is required')

    return createDocument(
      collectionPath,
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
  }

  return { createMenu }
}
