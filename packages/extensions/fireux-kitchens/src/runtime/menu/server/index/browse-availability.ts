import { FieldPath } from 'firebase-admin/firestore'
import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

/** Public directory eligibility matches the Menu directory, independent of services. */
export async function hasPublishedPublicMenu(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenId: string
): Promise<boolean> {
  let after: string | undefined
  for (;;) {
    let query = db.collection(`kitchens/${kitchenId}/menus`)
      .where('status', '==', 'published')
      .orderBy(FieldPath.documentId())
      .limit(50)
    if (after) query = query.startAfter(after)
    const page = await query.get()
    if (page.docs.some(doc => {
      const menu = doc.data()
      return menu.status === 'published' &&
        (menu.audience === undefined || menu.audience === 'public')
    })) return true
    if (page.docs.length < 50) return false
    after = page.docs.at(-1)!.id
  }
}
