import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response.ts'
import { guestDiscoverableMenuContexts } from '../../utils/menu-context'
import { readMenuOrderingConfig } from '../ordering/config'
import { menuSourceFromData } from '../payload/source'
import type { TenantMenuScope } from '../ownership/target'
import type { MenuDirectoryContext } from './context'

export type MenuDirectoryDocument = {
  id: string
  data: Record<string, unknown>
}

export function projectMenuDirectoryEntry(
  document: MenuDirectoryDocument,
  scopedKitchen?: TenantMenuScope | null,
  context: MenuDirectoryContext = {}
): MenuDirectoryEntry | null {
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
  // A published doorway must not outlive its published content source.
  if (
    !scopedKitchen &&
    hasSource &&
    readRecordString(context.menuData || {}, 'status') !== 'published'
  )
    return null
  const directorySource = hasSource
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
  const contentKind = readRecordString(orderingData || {}, 'system_kind')
  const contexts = guestDiscoverableMenuContexts(ordering)
  const storedKind = scopedKitchen ? 'menu' : readRecordString(data, 'kind')
  const kind =
    storedKind === 'menu' || storedKind === 'doc' ? storedKind : undefined
  const storedFileKind = readRecordString(data, 'file_kind')
  const fileKind =
    storedFileKind === 'photo' ||
    storedFileKind === 'pdf' ||
    storedFileKind === 'document'
      ? storedFileKind
      : undefined
  const description = readRecordString(data, 'description')
  return {
    id,
    kind,
    ...(kind === 'doc' && fileKind ? { file_kind: fileKind } : {}),
    name: readRecordString(data, 'name') || id,
    ...(description ? { description } : {}),
    status: 'published',
    ...(contentKind === 'food' || contentKind === 'drinks'
      ? { content_kind: contentKind }
      : {}),
    ...(contexts.length ? { contexts } : {}),
    ...(context.kitchen ? { kitchen: context.kitchen } : {}),
    ...(ordering?.service_hours
      ? { service_hours: ordering.service_hours }
      : {}),
    ...(directorySource ? { source: directorySource } : {}),
  }
}
