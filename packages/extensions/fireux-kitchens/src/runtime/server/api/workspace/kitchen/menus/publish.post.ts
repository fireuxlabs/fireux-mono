import { useRuntimeConfig } from '#imports'
import { defineEventHandler, readBody } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenWriter } from '../../../../../kitchen/server/core/operator-access'
import { publishKitchenMenu } from '../../../../../menu/server/publication/publish'

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const body = await readBody<{ kitchenId?: unknown; menuId?: unknown }>(event)
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const { db, uid } = await requireKitchenWriter(event, { appId, kitchenId })
  const kitchenPath = `apps/${appId}/kitchens/${kitchenId}`

  const published = await publishKitchenMenu({
    appId,
    db,
    kitchenId,
    kitchenPath,
    menuId,
    uid,
  })

  return {
    ok: true as const,
    menu_id: published.menuId,
    root_menu_id: published.root.id,
    root_menu_path: published.root.path,
  }
})
