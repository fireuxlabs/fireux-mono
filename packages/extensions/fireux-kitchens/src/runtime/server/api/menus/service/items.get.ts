import { createError, getQuery } from 'h3'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { readMenuDirectoryPage } from '../../../../menu/server/index/read'
import { menuServiceOfferings } from '../../../../menu/utils/service-menu'
import { type MenuServiceSource } from '../../../../menu/utils/service-sections'
import type { MenuDetailPayload } from '../../../../menu/models/menu-detail.model'

export default defineLiveReadHandler(async (event) => {
  const kitchenSlug = String(getQuery(event).kitchenSlug || '').trim()
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
    service !== 'room_service'
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unknown Menu service.',
    })
  const sources: MenuServiceSource[] = []
  let cursor: string | null = null
  do {
    const page = await readMenuDirectoryPage({
      kitchenSlug,
      offering,
      service,
      cursor,
      limit: 50,
    })
    const entries = await Promise.all(
      page.items
        .filter((menu) => menu.kind !== 'doc')
        .map(async (menu) => {
          const payload = await event.$fetch<MenuDetailPayload>(
            `/api/menus/${encodeURIComponent(menu.slug || menu.id)}`,
            {
              query: { kitchenSlug },
              headers: { accept: 'application/json' },
            }
          )
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
