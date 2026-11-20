import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'

export const foodSearchText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim()

export function matchesFoodSearch(value: unknown, query: string) {
  const text = foodSearchText(value)
  return foodSearchText(query)
    .split(/\s+/)
    .every((term) => text.includes(term))
}

/** Search only active public placements; no prices, options or Order records. */
export async function readMatchingMenuItems(
  db: ReturnType<typeof getRuntimeFirestore>,
  menu: MenuDirectoryEntry,
  query: string,
  sources?: LiveProjectionSources,
  dishId?: string
): Promise<Array<{ id: string; name: string }>> {
  const kitchenId = menu.source?.kitchen_id
  const menuId = menu.source?.menu_id
  if (!kitchenId || !menuId || menu.kind === 'doc') return []
  const base = `kitchens/${kitchenId}`
  const sectionsQuery = db.collection(`${base}/menus/${menuId}/sections`)
  sources?.watch(sectionsQuery)
  const sections = await sectionsQuery.get()
  const placements = await Promise.all(
    sections.docs
      .filter((doc) => doc.data().status !== 'archived')
      .map((doc) => {
        const collection = db.collection(
          `${base}/menus/${menuId}/sections/${doc.id}/items`
        )
        const placementsQuery = dishId
          ? collection.where('dish_id', '==', dishId)
          : collection
        sources?.watch(placementsQuery)
        return placementsQuery.get()
      })
  )
  const ids = [
    ...new Set(
      placements.flatMap((page) =>
        page.docs.flatMap((doc) => {
          const item = doc.data()
          return item.status !== 'archived' &&
            typeof item.dish_id === 'string' &&
            item.dish_id &&
            !item.dish_id.includes('/')
            ? [item.dish_id]
            : []
        })
      )
    ),
  ]
  const matches: Array<{ id: string; name: string }> = []
  for (let offset = 0; offset < ids.length; offset += 100) {
    const dishes = await db.getAll(
      ...ids.slice(offset, offset + 100).map((id) => {
        const reference = db.doc(`${base}/dishes/${id}`)
        sources?.watch(reference)
        return reference
      })
    )
    for (const dish of dishes) {
      const data = dish.data()
      if (
        dish.exists &&
        data?.status !== 'archived' &&
        typeof data?.name === 'string' &&
        (!query || matchesFoodSearch(data.name, query))
      )
        matches.push({ id: dish.id, name: data.name })
    }
  }
  return matches
}
