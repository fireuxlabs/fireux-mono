import type {
  DocumentData,
  DocumentReference,
  Firestore,
} from 'firebase-admin/firestore'

const text = (value: unknown) => String(value ?? '').trim()

export async function assertKitchenMenuCanPublish(input: {
  db: Firestore
  kitchenId: string
  menuRef: DocumentReference
  menuData: DocumentData
}) {
  const { menuRef, menuData } = input
  if (!text(menuData.doc?.url)) {
    const sectionsSnap = await menuRef.collection('sections').get()
    const sections = sectionsSnap.docs.filter(
      (section) => text(section.get('status')) !== 'archived'
    )
    if (!sections.length) throw new Error('Menu needs at least one section')

    let itemCount = 0
    for (const section of sections) {
      const itemsSnap = await section.ref.collection('items').get()
      const items = itemsSnap.docs.filter(
        (item) => text(item.get('status')) !== 'archived'
      )
      itemCount += items.length
      for (const item of items) {
        const dishId = text(item.get('dish_id'))
        if (!dishId) throw new Error('Every menu item needs a dish')
        const dishSnap = await input.db
          .doc(`kitchens/${input.kitchenId}/dishes/${dishId}`)
          .get()
        if (!dishSnap.exists) {
          throw new Error(`Menu item references missing dish: ${dishId}`)
        }
      }
    }
    if (!itemCount) throw new Error('Menu needs at least one item')
  }
}
