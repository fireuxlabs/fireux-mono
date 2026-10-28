import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { isMenuDate } from '../../utils/menu-date'
import { menuLocalDate, publishedMenuDates } from '../../utils/daily-menu'
import { assertKitchenMenuCanPublish } from './validation'

export async function publishDailyMenu(event: H3Event, input: unknown) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !['kitchenId', 'menuId', 'date', 'published'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid daily publication input.',
    })
  const value = input as Record<string, unknown>
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(value.menuId, 'Menu id')
  if (!isMenuDate(value.date) || typeof value.published !== 'boolean')
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a valid date and publication action.',
    })
  const date = value.date,
    published = value.published
  const actor = await readKitchenMutationActor(event)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    if (published && !['premium', 'business'].includes(access.subscription))
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily menus require Plus.',
      })
    const target = serverKitchenMenusTarget(kitchenId)
    const menu = await tx.read(target, menuId)
    if (
      !menu.exists ||
      menu.data?.schedule !== 'daily' ||
      menu.data.status === 'archived' ||
      menu.data.doc?.url
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Open an active daily Menu.',
      })
    if (published) {
      try {
        menuLocalDate(String(access.placeData.timezone || ''))
      } catch {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Set a valid Place timezone before publishing a daily Menu.',
        })
      }
    }
    const currencyCode = readPlaceCurrencyCode(access.placeData)
    if (published && !currencyCode)
      throw createError({
        statusCode: 409,
        statusMessage: 'Set the Place currency before publishing a daily Menu.',
      })
    if (published)
      await assertKitchenMenuCanPublish(tx, {
        kitchenId,
        menuId,
        menuData: menu.data,
        currencyCode,
        date,
      })
    const dates = publishedMenuDates(menu.data.published_dates).filter(
      (value) => value !== date
    )
    if (published) dates.push(date)
    const stamp = serverAuditStamp({ by: actor.uid, appId: actor.runtimeAppId })
    tx.update(target, menuId, {
      status: published ? 'published' : menu.data.status,
      published_dates: dates.sort(),
      updated: stamp,
    })
  })
  return { ok: true, kitchenId, menuId, date, published }
}
