import type { KitchenOffering } from '../../../kitchen/models/offering.model'
import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

/** Distinct public offerings outside the venue's Collection/Delivery menus. */
export async function readOtherMenuOfferings(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenId: string,
  offerings: KitchenOffering[]
): Promise<Array<{ id: string; name: string; menu_slug: string }>> {
  const active = offerings.filter(
    (offering) =>
      offering.enabled &&
      offering.interactions.some((interaction) => interaction.enabled)
  )
  const covered = new Set(
    active
      .filter((offering) =>
        offering.interactions.some(
          (interaction) =>
            interaction.enabled &&
            (interaction.type === 'collection' ||
              interaction.type === 'delivery')
        )
      )
      .flatMap((offering) => offering.menu_ids)
  )
  const ids = [
    ...new Set(
      active
        .flatMap((offering) => offering.menu_ids)
        .filter((id) => !covered.has(id))
    ),
  ]
  const result: Array<{ id: string; name: string; menu_slug: string }> = []
  for (let offset = 0; offset < ids.length; offset += 100) {
    const menus = await db.getAll(
      ...ids
        .slice(offset, offset + 100)
        .map((id) => db.doc(`kitchens/${kitchenId}/menus/${id}`))
    )
    for (const menu of menus) {
      const data = menu.data()
      if (
        menu.exists &&
        data?.status === 'published' &&
        data.schedule !== 'daily' &&
        (data.audience === undefined || data.audience === 'public') &&
        typeof data.slug === 'string' &&
        typeof data.name === 'string'
      ) {
        result.push({ id: menu.id, name: data.name, menu_slug: data.slug })
      }
    }
  }
  return result
}
