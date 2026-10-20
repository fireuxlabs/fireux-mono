import type { H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenWriter } from '../core/operator-access'
import { readKitchenOperatorContext, readMenuOperatorContext } from './read'

/** Private context is never accepted from the page's client-supplied facts. */
export async function readAuthorizedOperatorContext(
  event: H3Event,
  kitchenId: string,
  menuIds: string[] = []
) {
  const id = requireFirestoreDocumentId(kitchenId, 'Kitchen id')
  const menus = [...new Set(menuIds)]
    .slice(0, 12)
    .map((id) => requireFirestoreDocumentId(id, 'Menu id'))
  const access = await requireKitchenWriter(event, {
    appId: useFireUXConfig(event).appId,
    kitchenId: id,
  })
  const context = await readKitchenOperatorContext(
    access.db,
    id,
    access.rootKitchen
  )
  return {
    ...context,
    menus: await Promise.all(
      menus.map(async (menuId) => ({
        menuId,
        context: await readMenuOperatorContext(access.db, id, menuId),
      }))
    ),
  }
}
