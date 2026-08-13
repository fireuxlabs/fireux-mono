// Concurrent edit — 2026-07-20 21:19 CEST — Place-root authority pass: create sparse KitchenMenus using their exact linked Place authority.
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { doc, getDoc } from 'firebase/firestore'
import { computed, unref, type Ref } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  MenuStorage,
  type Menu,
} from '../../../../../models/kitchen/menu/kitchen-menu.model'
import { useKitchenConsoleSelection } from '../../../console/kitchen/core/useKitchenConsoleSelection'
import { resolveKitchenScopeCollectionPath } from '../../kitchen/utils/paths/useKitchenChildCollection'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/utils/place-spine'
import { compactMenuServiceHoursDelta } from '../../../../../utils/menu-service-hours'

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
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const compactValue = (value: unknown): unknown => {
  if (typeof value === 'string') return normalizeString(value) || undefined
  if (Array.isArray(value)) {
    const items = value
      .map(compactValue)
      .filter(item => item !== undefined)
    return items.length ? items : undefined
  }
  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactValue(item)] as const)
      .filter(([, item]) => item !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return value === null || value === undefined ? undefined : value
}

function buildMenuPayload(
  input: MenuCreateInput,
  name: string
): Partial<Menu> {
  const kitchenId = normalizeString(input.kitchenId)
  const orderTypes = Array.isArray(input.ordering?.order_types)
    ? input.ordering.order_types
        .map(compactValue)
        .filter((row): row is Record<string, unknown> =>
          isRecord(row) && Boolean(normalizeString(row.type))
        )
    : []
  const serviceHours = compactMenuServiceHoursDelta(
    input.ordering?.service_hours
  )
  const payload: Partial<Menu> = {
    kitchen_id: kitchenId,
    name,
    status: input.status || 'draft',
  }
  const put = (key: keyof Menu, value: unknown) => {
    const next = normalizeString(value)
    if (next) (payload as Record<string, unknown>)[key] = next
  }

  put('description', input.description)
  put('doc_url', input.doc_url)
  put('doc_name', input.doc_name)
  put('doc_type', input.doc_type)
  put('doc_storage_path', input.doc_storage_path)
  if (input.ordering?.enabled === true && orderTypes.length) {
    payload.ordering = {
      enabled: true,
      order_types: orderTypes as Menu['ordering']['order_types'],
      ...(serviceHours ? { service_hours: serviceHours } : {}),
    }
  } else if (serviceHours) {
    payload.ordering = {
      enabled: false,
      service_hours: serviceHours,
    } as Menu['ordering']
  }

  return payload
}

export function useMenuCreate(
  options: {
    kitchenCollectionPath?: string | Ref<string | null | undefined>
    kitchenId?: string | Ref<string | null | undefined>
    useSelectedKitchen?: boolean
    databaseId?: string | Ref<string | null | undefined>
  } = {}
) {
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const create = useFirestoreClientCreate()
  const { appId } = useFireUXConfig()
  const { selectedId } = useKitchenConsoleSelection()
  const db = useFirestore(options.databaseId)

  const kitchenCollectionPath = computed(() =>
    normalizeString(unref(options.kitchenCollectionPath)) ||
    resolveKitchenScopeCollectionPath(appId)
  )
  const defaultKitchenId = computed(() =>
    normalizeString(unref(options.kitchenId)) ||
    (options.useSelectedKitchen ? normalizeString(selectedId.value) : '')
  )

  async function requireLinkedPlaceCurrency(kitchenId: string) {
    const kitchenSnap = await getDoc(
      doc(db, KitchenStorage.collection, kitchenId)
    )
    if (!kitchenSnap.exists()) throw new Error('Kitchen not found.')

    const placeSnap = await getDoc(doc(db, PlaceStorage.collection, kitchenId))
    if (!readPlaceCurrencyCode(placeSnap.data())) {
      throw new Error('Set the linked Place currency before creating menus.')
    }
  }

  async function createMenu(input: MenuCreateInput): Promise<{ created: boolean; id: string }> {
    requireWritableData()
    const kitchenId = normalizeString(input.kitchenId || defaultKitchenId.value)
    const name = normalizeString(input.name)
    const menuId = normalizeSlug(input.id || name)
    const collectionPath =
      `${kitchenCollectionPath.value}/${kitchenId}/${MenuStorage.scopeCollection}`

    if (!name) throw new Error('Menu name is required')
    if (!kitchenId) throw new Error('Kitchen id is required')
    await requireLinkedPlaceCurrency(kitchenId)

    const payload = buildMenuPayload({ ...input, kitchenId }, name)
    const id = await create(
      defineRuntimeClientCreateTarget(
        'project.kitchen-menus',
        collectionPath
      ),
      payload,
      {
        ...(menuId ? { id: menuId } : {}),
        app: true,
        creator: true,
      }
    )

    return { created: true, id }
  }

  return { createMenu }
}
