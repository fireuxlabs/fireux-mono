import { constrainMenuOfferings } from '../../utils/menu-hours'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response.ts'
import { guestDiscoverableMenuContexts } from '../../utils/menu-context'
import { readKitchenPublicOfferings } from '../../../kitchen/utils/public-offerings'
import { publicMenuOrderTypes } from '../../utils/menu-ordering'
import { readKitchenMenuOrdering } from '../offerings/projection'
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
  if (data.audience !== undefined && data.audience !== 'public') return null
  if (!scopedKitchen) return null
  const source = menuSourceFromData(data, {
    kitchenAppId: scopedKitchen.appId,
    kitchenId: scopedKitchen.kitchenId,
    kitchenSlug: scopedKitchen.kitchenSlug,
    kitchenName: context.kitchenName,
    kitchenMenuId: id,
    kitchenMenuSlug: readRecordString(data, 'slug'),
  })
  const directorySource = {
    app_id: source.app_id || '',
    kitchen_id: scopedKitchen.kitchenId,
    menu_id: id,
    menu_slug: readRecordString(data, 'slug'),
    kitchen_slug: scopedKitchen.kitchenSlug,
    ...(context.kitchenName ? { kitchen_name: context.kitchenName } : {}),
  }
  const menuOfferings = constrainMenuOfferings(
    context.kitchenOfferings,
    data.serving_hours
  )
  const ordering =
    data.schedule !== 'daily'
      ? readKitchenMenuOrdering(menuOfferings, id)
      : null
  const sortOrder = Number(data.sort_order)
  const contexts = guestDiscoverableMenuContexts(ordering)
  const attachment =
    data.doc && typeof data.doc === 'object'
      ? (data.doc as Record<string, unknown>)
      : {}
  const kind = data.format === 'document' ? 'doc' : 'menu'
  const fileKind =
    kind === 'doc'
      ? documentKindFromFile({
          fileName: readRecordString(attachment, 'name'),
          contentType: readRecordString(attachment, 'type'),
        })
      : undefined
  const description = readRecordString(data, 'description')
  return {
    id,
    slug: readRecordString(data, 'slug'),
    kind,
    ...(context.otherOfferings?.length
      ? { other_offerings: context.otherOfferings }
      : {}),
    ...(kind === 'doc' && fileKind ? { file_kind: fileKind } : {}),
    name: readRecordString(data, 'name') || id,
    ...(description ? { description } : {}),
    status: 'published',
    offerings: readKitchenPublicOfferings(menuOfferings, id),
    ...(Number.isFinite(sortOrder) ? { sort_order: sortOrder } : {}),
    ...(contexts.length ? { contexts } : {}),
    ...(kind !== 'doc' && ordering?.order_types.length
      ? {
          offering_options: [
            ...publicMenuOrderTypes(ordering),
            ...ordering.order_types.filter(
              (option) =>
                option.type === 'room_service' && !option.availability?.paused
            ),
          ].map(
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
