import { createError, defineEventHandler, getQuery } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { menuSourceFromData } from '../../menu/payload/source.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import { KitchenMenuStorage } from '../../../models/kitchen/menu/kitchen-menu.model.ts'
import {
  resolveTenantPublicMenuScope,
  resolveDirectoryPublicMenuScope,
  type TenantPublicMenuScope,
} from '../../menu/ownership/public-target.ts'

const text = (value: unknown) => String(value ?? '').trim()

const publicMenuIndexItem = (
  id: string,
  data: Record<string, unknown>,
  tenantScope?: TenantPublicMenuScope | null
) => {
  const status = readRecordString(data, 'status')
  if (status !== 'published') return null

  const source = tenantScope
    ? menuSourceFromData(data, {
        kitchenAppId: tenantScope.appId,
        kitchenId: tenantScope.kitchenId,
        kitchenSlug: tenantScope.kitchenSlug,
        kitchenMenuId: id,
      })
    : menuSourceFromData(data)

  return {
    id,
    kind: tenantScope ? 'menu' : readRecordString(data, 'kind') || undefined,
    name: readRecordString(data, 'name') || id,
    description: readRecordString(data, 'description'),
    status,
    source,
  }
}

export default defineEventHandler(async (event) => {
  const db = getRuntimeFirestore()
  const tenantScope = await resolveTenantPublicMenuScope()
  const kitchenSlug = text(getQuery(event).kitchenSlug)
  if (tenantScope && kitchenSlug) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menus not found.',
    })
  }
  const directoryScope = !tenantScope && kitchenSlug
    ? await resolveDirectoryPublicMenuScope(kitchenSlug)
    : null
  const scopedKitchen = tenantScope || directoryScope

  const collectionPath = scopedKitchen
    ? `apps/${scopedKitchen.appId}/kitchens/${scopedKitchen.kitchenId}/${KitchenMenuStorage.collection}`
    : MenuStorage.rootCollection
  const snap = await db
    .collection(collectionPath)
    .where('status', '==', 'published')
    .limit(100)
    .get()
  const menus = snap.docs
    .map((doc) => publicMenuIndexItem(doc.id, doc.data(), scopedKitchen))
    .filter((menu): menu is NonNullable<typeof menu> => Boolean(menu))

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
