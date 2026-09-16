import { useRuntimeConfig } from '#imports'
import { defineEventHandler, readBody } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { publishKitchenMenu } from '../../../../../menu/server/publication/publish'

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const body = await readBody<{ kitchenId?: unknown; menuId?: unknown }>(event)
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to manage this Kitchen.'
  )

  const published = await publishKitchenMenu({
    appId,
    kitchenId,
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
