import { useRuntimeConfig } from '#imports'
import { defineEventHandler, readBody } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenWriter } from '../../../../../kitchen/server/core/operator-access'
import { syncKitchenMenuDirectory } from '../../../../../menu/server/directory/sync'

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const body = await readBody<{
    kitchenId?: unknown
    menuId?: unknown
  }>(event)
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const { db, uid } = await requireKitchenWriter(event, { appId, kitchenId })
  const root = await syncKitchenMenuDirectory({
    appId,
    db,
    kitchenId,
    menuId,
    uid,
  })
  return { ok: true as const, root_menu_id: root.id }
})
