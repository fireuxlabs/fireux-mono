import type { KitchenOffering } from '../../../kitchen/models/offering.model'
import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

/** Distinct public offerings outside the venue's Collection/Delivery menus. */
export async function readOtherMenuOfferings(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenId: string,
  offerings: KitchenOffering[]
): Promise<Array<{ id: string; name: string; service?: 'collection' }>> {
  const active = offerings.filter(
    (offering) =>
      offering.enabled &&
      offering.interactions.some((interaction) => interaction.enabled)
  )
  const covered = new Set(
    active
      .filter(
        (offering) =>
          offering.collection_timing !== 'next_day' &&
          offering.interactions.some(
            (interaction) =>
              interaction.enabled &&
              (interaction.type === 'collection' ||
                interaction.type === 'delivery')
          )
      )
      .flatMap((offering) => offering.menu_ids)
  )
  const candidates = active.filter(
    (offering) =>
      offering.collection_timing === 'next_day' ||
      offering.menu_ids.some((id) => !covered.has(id))
  )
  const ids = [
    ...new Set(
      candidates.flatMap((offering) =>
        offering.menu_ids.filter(
          (id) => offering.collection_timing === 'next_day' || !covered.has(id)
        )
      )
    ),
  ]
  const publicIds = new Set<string>()
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
        (data.audience === undefined || data.audience === 'public')
      )
        publicIds.add(menu.id)
    }
  }
  const seen = new Set<string>()
  return candidates.flatMap((offering) => {
    const menus = offering.menu_ids.filter((id) => publicIds.has(id)).sort()
    if (!menus.length) return []
    const key = `${offering.name.trim().toLowerCase()}:${menus.join(',')}`
    if (seen.has(key)) return []
    seen.add(key)
    return [
      {
        id: offering.id,
        name: offering.name,
        ...(offering.collection_timing === 'next_day'
          ? { service: 'collection' as const }
          : {}),
      },
    ]
  })
}
