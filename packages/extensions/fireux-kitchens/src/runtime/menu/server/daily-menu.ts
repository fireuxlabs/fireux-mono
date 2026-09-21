import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuSectionsTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../kitchen/server/core/mutation-authority'
import { isMenuDate } from '../utils/menu-date'

export async function configureDailyMenu(
  event: H3Event,
  input: {
    kitchenId?: unknown
    menuId?: unknown
    schedule?: unknown
    date?: unknown
    label?: unknown
    copyFrom?: unknown
  }
) {
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const menuId = requireFirestoreDocumentId(input.menuId, 'Menu id')
  const actor = await readKitchenMutationActor(event)
  const addingDay = input.date !== undefined
  const copying = input.copyFrom !== undefined
  if (copying && (!isMenuDate(input.copyFrom) || input.copyFrom === input.date))
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a different valid source date.',
    })
  if (addingDay && !isMenuDate(input.date))
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a valid date.',
    })
  if (!addingDay && !['regular', 'daily'].includes(String(input.schedule)))
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a menu schedule.',
    })
  const label = typeof input.label === 'string' ? input.label.trim() : ''
  if (addingDay && !copying && (!label || label.length > 160))
    throw createError({
      statusCode: 400,
      statusMessage: 'A selection name is required (up to 160 characters).',
    })
  const sectionId = randomUUID()
  await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const access = await requireKitchenMutationAuthority(tx, actor, kitchenId)
    if (!['premium', 'business'].includes(access.subscription))
      throw createError({
        statusCode: 403,
        statusMessage: 'Daily menus require Plus.',
      })
    const target = serverKitchenMenusTarget(kitchenId)
    const menu = await tx.read(target, menuId)
    if (!menu.exists)
      throw createError({ statusCode: 404, statusMessage: 'Menu not found.' })
    const sectionsTarget = serverKitchenMenuSectionsTarget(kitchenId, menuId)
    const sections = await tx.readAll(sectionsTarget, 1000)
    if (sections.length === 1000)
      throw createError({
        statusCode: 409,
        statusMessage: 'This menu has reached its selection limit.',
      })
    const active = sections.filter(
      (section) => section.data.status !== 'archived'
    )
    if (addingDay) {
      if (menu.data.schedule !== 'daily')
        throw createError({
          statusCode: 409,
          statusMessage: 'Set this menu to Daily first.',
        })
      if (copying) {
        if (active.some((section) => section.data.date === input.date))
          throw createError({
            statusCode: 409,
            statusMessage: 'The destination date already has selections.',
          })
        const source = active.filter(
          (section) => section.data.date === input.copyFrom
        )
        if (!source.length)
          throw createError({
            statusCode: 404,
            statusMessage: 'There is nothing to copy from that date.',
          })
        const copies = await Promise.all(
          source.map(async (section) => ({
            section,
            items: await tx.readAll(
              serverKitchenMenuItemsTarget(kitchenId, menuId, section.id),
              400
            ),
          }))
        )
        if (
          copies.reduce((count, copy) => count + copy.items.length + 1, 0) > 400
        )
          throw createError({
            statusCode: 400,
            statusMessage: 'Too many items to copy in one action.',
          })
        const stamp = serverAuditStamp({
          by: actor.uid,
          appId: actor.runtimeAppId,
        })
        for (const copy of copies) {
          const id = randomUUID()
          tx.create(sectionsTarget, id, {
            kitchen_id: kitchenId,
            menu_id: menuId,
            date: input.date,
            label: copy.section.data.label,
            description: copy.section.data.description || '',
            status: 'active',
            sort_order: copy.section.data.sort_order || 0,
            created: stamp,
            updated: stamp,
          })
          for (const item of copy.items.filter(
            (item) => item.data.status !== 'archived'
          )) {
            const {
              id: _oldId,
              created: _created,
              updated: _updated,
              ...data
            } = item.data
            tx.create(
              serverKitchenMenuItemsTarget(kitchenId, menuId, id),
              randomUUID(),
              { ...data, section_id: id, created: stamp, updated: stamp }
            )
          }
        }
        return
      }
      if (
        active.some(
          (section) =>
            section.data.date === input.date && section.data.label === label
        )
      )
        throw createError({
          statusCode: 409,
          statusMessage: 'This selection already exists on that date.',
        })
      const stamp = serverAuditStamp({
        by: actor.uid,
        appId: actor.runtimeAppId,
      })
      tx.create(sectionsTarget, sectionId, {
        kitchen_id: kitchenId,
        menu_id: menuId,
        date: input.date,
        label,
        description: '',
        status: 'active',
        sort_order: active.length,
        created: stamp,
        updated: stamp,
      })
    } else {
      if (menu.data.status === 'published')
        throw createError({
          statusCode: 409,
          statusMessage: 'Unpublish the menu before changing its schedule.',
        })
      if (active.length && input.schedule !== (menu.data.schedule || 'regular'))
        throw createError({
          statusCode: 409,
          statusMessage:
            'Create a separate menu to use a different schedule. Existing selections are preserved.',
        })
      tx.update(target, menuId, {
        schedule: input.schedule,
        updated: serverAuditStamp({ by: actor.uid }),
      })
    }
  })
  return { ok: true, ...(addingDay ? { sectionId } : {}) }
}
