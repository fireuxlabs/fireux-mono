import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { PublicMenuIndexItem } from '../../models/menu-index.model.ts'
import { guestDiscoverableMenuContexts } from '../../utils/menu-context'
import { readMenuOrderingConfig } from '../ordering/config'
import { menuSourceFromData } from '../payload/source'
import type { TenantPublicMenuScope } from '../ownership/public-target'
import type { MenuIndexContext } from './context'

export type MenuIndexDocument = {
  id: string
  data: Record<string, unknown>
}

export function projectMenuIndexItem(
  document: MenuIndexDocument,
  scopedKitchen?: TenantPublicMenuScope | null,
  context: MenuIndexContext = {}
): PublicMenuIndexItem | null {
  const { id, data } = document
  if (readRecordString(data, 'status') !== 'published') return null
  const source = scopedKitchen
    ? menuSourceFromData(data, {
        kitchenAppId: scopedKitchen.appId,
        kitchenId: scopedKitchen.kitchenId,
        kitchenSlug: scopedKitchen.kitchenSlug,
        ...(context.kitchenName ? { kitchenName: context.kitchenName } : {}),
        kitchenMenuId: id,
      })
    : menuSourceFromData(
        data,
        context.kitchenName ? { kitchenName: context.kitchenName } : {}
      )
  const hasSource = Boolean(
    source.app_id && source.kitchen_id && source.menu_id
  )
  const publicSource = hasSource
    ? {
        app_id: source.app_id || '',
        kitchen_id: source.kitchen_id || '',
        menu_id: source.menu_id || '',
        ...(source.kitchen_slug ? { kitchen_slug: source.kitchen_slug } : {}),
        ...(source.kitchen_name ? { kitchen_name: source.kitchen_name } : {}),
      }
    : null
  const orderingData = scopedKitchen ? data : context.menuData
  const ordering = orderingData
    ? readMenuOrderingConfig(
        orderingData,
        undefined,
        context.kitchenOperationHours
      )
    : null
  const contexts = guestDiscoverableMenuContexts(ordering)
  const storedKind = scopedKitchen ? 'menu' : readRecordString(data, 'kind')
  const kind =
    storedKind === 'menu' || storedKind === 'doc' ? storedKind : undefined
  const description = readRecordString(data, 'description')
  return {
    id,
    kind,
    name: readRecordString(data, 'name') || id,
    ...(description ? { description } : {}),
    status: 'published',
    ...(contexts.length ? { contexts } : {}),
    ...(context.kitchen ? { kitchen: context.kitchen } : {}),
    ...(ordering?.service_hours
      ? { service_hours: ordering.service_hours }
      : {}),
    ...(publicSource ? { source: publicSource } : {}),
  }
}
