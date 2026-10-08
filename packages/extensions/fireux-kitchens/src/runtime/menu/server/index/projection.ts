import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response.ts'
import { guestDiscoverableMenuContexts } from '../../utils/menu-context'
import { readKitchenPublicOfferings } from '../../../kitchen/utils/public-offerings'
import { readKitchenMenuOrdering } from '../ordering/config'
import { menuSourceFromData } from '../payload/source'
import type { TenantMenuScope } from '../ownership/target-types'
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
        menu_slug: readRecordString(
          scopedKitchen ? data : context.menuData || {},
          'slug'
        ),
        ...(context.kitchenSlug || source.kitchen_slug
          ? { kitchen_slug: context.kitchenSlug || source.kitchen_slug }
          : {}),
        ...(source.kitchen_name ? { kitchen_name: source.kitchen_name } : {}),
      }
    : null
  const orderingData = scopedKitchen ? data : context.menuData
  const ordering = orderingData
    ? readKitchenMenuOrdering(
        context.kitchenOfferings,
        scopedKitchen ? id : source.menu_id || '',
        undefined
      )
    : null
  const sortOrder = Number(
    (scopedKitchen ? data : hasSource ? context.menuData : data)?.sort_order
  )
  const contexts = guestDiscoverableMenuContexts(ordering)
  const contentData = scopedKitchen ? data : hasSource ? context.menuData : data
  const attachment =
    contentData?.doc && typeof contentData.doc === 'object'
      ? (contentData.doc as Record<string, unknown>)
      : undefined
  const hasAttachment = Boolean(
    (scopedKitchen || hasSource) &&
      attachment &&
      readRecordString(attachment, 'url')
  )
  const storedKind = hasAttachment
    ? 'doc'
    : scopedKitchen
      ? 'menu'
      : readRecordString(data, 'kind')
  const kind =
    storedKind === 'menu' || storedKind === 'doc' ? storedKind : undefined
  const storedFileKind =
    hasAttachment && attachment
      ? documentKindFromFile({
          fileName: readRecordString(attachment, 'name'),
          contentType: readRecordString(attachment, 'type'),
        })
      : readRecordString(data, 'file_kind')
  const fileKind =
    storedFileKind === 'photo' ||
    storedFileKind === 'pdf' ||
    storedFileKind === 'document'
      ? storedFileKind
      : undefined
  const description = readRecordString(data, 'description')
  return {
    id,
    ...(scopedKitchen ? { slug: readRecordString(data, 'slug') } : {}),
    kind,
    ...(kind === 'doc' && fileKind ? { file_kind: fileKind } : {}),
    name: readRecordString(data, 'name') || id,
    ...(description ? { description } : {}),
    status: 'published',
    ...(scopedKitchen || hasSource
      ? {
          offerings: readKitchenPublicOfferings(
            context.kitchenOfferings,
            scopedKitchen ? id : source.menu_id || ''
          ),
        }
      : {}),
    ...(Number.isFinite(sortOrder) ? { sort_order: sortOrder } : {}),
    ...(contexts.length ? { contexts } : {}),
    ...(kind !== 'doc' && ordering?.order_types.length
      ? {
          offering_options: ordering.order_types.map(
            ({
              kitchen_offering_id,
              kitchen_offering_name,
              type,
              availability,
            }) => ({
              kitchen_offering_id,
              kitchen_offering_name,
              type,
              ...(availability?.paused ? { paused: true } : {}),
            })
          ),
        }
      : {}),
    ...(context.kitchen ? { kitchen: context.kitchen } : {}),
    ...(directorySource ? { source: directorySource } : {}),
  }
}
