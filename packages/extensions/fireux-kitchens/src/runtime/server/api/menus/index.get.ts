import { defineEventHandler } from 'h3'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { menuSourceFromData } from '../../menu/payload/source.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'
import {
  menuRoutePath,
  menuRouteQrPath,
  rootMenuRouteScope,
} from '../../../utils/kitchen-menu-route.ts'
import {
  resolveTenantPublicMenuScope,
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

  const path = menuRoutePath({
    scope: rootMenuRouteScope(),
    menuId: id,
  })
  const qrPath = menuRouteQrPath({
    scope: rootMenuRouteScope(),
    menuId: id,
  })
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
    slug: text(data.slug) || id,
    name: readRecordString(data, 'name') || id,
    description: readRecordString(data, 'description'),
    status,
    path,
    qr_path: tenantScope ? qrPath : text(data.qr_path) || qrPath,
    source_kind:
      readRecordString(data, 'source_kind') ||
      (tenantScope ? 'kitchen-menu' : readRecordString(data, 'kind')),
    source,
    image_url: readRecordString(data, 'image_url'),
    image_shade: readRecordString(data, 'image_shade'),
  }
}

export default defineEventHandler(async () => {
  const db = getRuntimeFirestore()
  const tenantScope = await resolveTenantPublicMenuScope()

  const collectionPath = tenantScope
    ? `apps/${tenantScope.appId}/kitchens/${tenantScope.kitchenId}/${MenuStorage.scopeCollection}`
    : MenuStorage.rootCollection
  const snap = await db
    .collection(collectionPath)
    .where('status', '==', 'published')
    .limit(100)
    .get()
  const menus = snap.docs
    .map((doc) => publicMenuIndexItem(doc.id, doc.data(), tenantScope))
    .filter((menu): menu is NonNullable<typeof menu> => Boolean(menu))

  return menus.sort((a, b) => a.name.localeCompare(b.name))
})
