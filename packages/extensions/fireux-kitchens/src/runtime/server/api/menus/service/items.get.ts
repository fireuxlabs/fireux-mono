import {
  defineEventHandler,
  setResponseHeader,
  createError,
  getQuery,
} from 'h3'

import { readMenuDirectoryPage } from '../../../../menu/server/index/read'
import { menuServiceOfferings } from '../../../../menu/utils/ordering/offerings'
import { type MenuServiceSource } from '../../../../menu/utils/ordering/sections'
import type { MenuDetailPayload } from '../../../../menu/models/menu-detail.model'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const kitchenSlug = String(getQuery(event).kitchenSlug || '').trim()
  const { isTenant } = useFireUXConfig(event)
  if (!kitchenSlug)
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen is required.',
    })
  const offering = String(getQuery(event).offering || '').trim()
  const service = getQuery(event).service
  if (
    service !== 'collection' &&
    service !== 'delivery' &&
    service !== 'table' &&
    service !== 'room_service' &&
    service !== 'eat_in' &&
    service !== 'takeaway'
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unknown Menu service.',
    })
  const sources: MenuServiceSource[] = []
  let cursor: string | null = null
  do {
    const page = await readMenuDirectoryPage({
      kitchenSlug: isTenant ? undefined : kitchenSlug,
      offering,
      service,
      cursor,
      limit: 50,
    })
    if (
      isTenant &&
      (page.scope.kind !== 'tenant' || page.scope.kitchenSlug !== kitchenSlug)
    )
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen Menu not found.',
      })
    const entries = await Promise.all(
      page.items
        .filter((menu) => menu.kind !== 'doc')
        .map(async (menu) => {
          const payload = await event.$fetch<MenuDetailPayload>(
            `/api/menus/${encodeURIComponent(menu.slug || menu.id)}`,
            {
              query: isTenant ? {} : { kitchenSlug },
              headers: { accept: 'application/json' },
            }
          )
          if (payload.kind === 'manifest' && service === 'eat_in')
            for (const section of payload.manifest.content.sections)
              for (const item of section.items) delete item.bottleDeposit
          return payload.kind === 'manifest'
            ? {
                manifest: payload.manifest,
                offerings: menuServiceOfferings(menu, service, offering),
              }
            : null
        })
    )
    for (const entry of entries) if (entry) sources.push(entry)
    cursor = page.nextCursor
  } while (cursor)
  return { sources }
})
