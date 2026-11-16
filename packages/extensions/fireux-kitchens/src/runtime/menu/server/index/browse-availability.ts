import { readKitchenMenuSections } from '../manifest/sections'
import { FieldPath } from 'firebase-admin/firestore'
import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { dailyMenuSelection, menuLocalDate } from '../../utils/calendar/daily'
import type { KitchenDirectoryEntry } from '../../../kitchen/types/public'

/** Public directory eligibility matches the Menu directory, independent of services. */
export async function readPublishedPublicMenuSummary(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenId: string,
  timezone: string,
  presentation: {
    appId: string
    currencyCode?: string
    showItemImages: boolean
  }
): Promise<{
  hasPublishedMenu: boolean
  special?: KitchenDirectoryEntry['special']
}> {
  let after: string | undefined
  let hasPublishedMenu = false
  let special: KitchenDirectoryEntry['special']
  let specialMenuId = ''
  for (;;) {
    let query = db
      .collection(`kitchens/${kitchenId}/menus`)
      .where('status', '==', 'published')
      .orderBy(FieldPath.documentId())
      .limit(50)
    if (after) query = query.startAfter(after)
    const page = await query.get()
    for (const doc of page.docs) {
      const menu = doc.data()
      if (
        menu.status !== 'published' ||
        (menu.audience !== undefined && menu.audience !== 'public')
      )
        continue
      hasPublishedMenu = true
      if (
        menu.schedule !== 'daily' ||
        menu.purpose !== 'specials' ||
        typeof menu.slug !== 'string' ||
        !menu.slug.trim()
      )
        continue
      try {
        const selected = dailyMenuSelection(menu, timezone)
        if (selected.published && (!special || selected.date < special.date)) {
          specialMenuId = doc.id
          special = {
            date: selected.date,
            slug: menu.slug,
            today: selected.date === menuLocalDate(timezone),
            nextChangeAt: selected.nextChangeAt,
            items: [],
            ...(presentation.currencyCode
              ? { currencyCode: presentation.currencyCode }
              : {}),
          }
        }
      } catch {
        /* A missing or invalid Place timezone cannot advertise a dated special. */
      }
    }
    if (page.docs.length < 50) break
    after = page.docs.at(-1)!.id
  }
  if (special) {
    const sections = await readKitchenMenuSections(db, {
      appId: presentation.appId,
      kitchenId,
      menuId: specialMenuId,
      date: special.date,
      currencyCode: presentation.currencyCode,
    })
    special.items = sections
      .flatMap((section) => section.items)
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        ...(presentation.showItemImages && item.image_url
          ? { imageUrl: item.image_url }
          : {}),
      }))
    if (!special.items.length) special = undefined
  }
  return { hasPublishedMenu, ...(special ? { special } : {}) }
}
