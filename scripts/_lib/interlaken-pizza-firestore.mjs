// @fireux-script
// last_used: 2026-07-21
// usage_note: read the fixed Interlaken Pizza Dish, KitchenMenu, MenuSection, and MenuItem records without exposing any mutation seam.
// Concurrent edit — 2026-07-21 23:48 CEST — Interlaken Pizza audit cleanup: isolate the bounded read-only Firestore adapter.

import { INTERLAKEN_PIZZA_TARGET } from './interlaken-pizza-target.mjs'

export async function readInterlakenCurrentState(firestore) {
  const target = INTERLAKEN_PIZZA_TARGET
  const basePath = `apps/${target.appId}/kitchens/${target.kitchenId}`
  const menuRef = firestore.doc(`${basePath}/menus/${target.menuId}`)
  const [dishesSnapshot, menuSnapshot, sectionsSnapshot] = await Promise.all([
    firestore.collection(`${basePath}/dishes`).get(),
    menuRef.get(),
    menuRef.collection('sections').get(),
  ])

  if (!menuSnapshot.exists) {
    throw new Error(`Expected KitchenMenu does not exist: ${menuRef.path}`)
  }

  const sections = sectionsSnapshot.docs
    .map((document) => ({
      id: document.id,
      label: text(document.data().label),
      description: text(document.data().description),
      status: text(document.data().status) || 'active',
      sortOrder: numberValue(document.data().sort_order),
    }))
    .sort(bySortOrderThenId)
  const itemSnapshots = await Promise.all(
    sections.map((section) =>
      menuRef.collection('sections').doc(section.id).collection('items').get()
    )
  )
  const menuItems = itemSnapshots
    .flatMap((snapshot, sectionIndex) => {
      const section = sections[sectionIndex]
      return snapshot.docs.map((document) => {
        const data = document.data()
        return {
          id: document.id,
          sectionId: section.id,
          sectionLabel: section.label,
          dishId: text(data.dish_id),
          itemKind: text(data.item_kind),
          isDeal: data.is_deal === true,
          imageUrl: text(data.image_url),
          price: numberValue(data.price),
          priceOptions: array(data.price_options),
          addOns: array(data.add_ons),
          status: text(data.status) || 'active',
          sortOrder: numberValue(data.sort_order),
        }
      })
    })
    .sort(
      (left, right) =>
        left.sectionId.localeCompare(right.sectionId) ||
        bySortOrderThenId(left, right)
    )
  const dishes = dishesSnapshot.docs
    .map((document) => {
      const data = document.data()
      return {
        id: document.id,
        storedId: text(data.id),
        name: text(data.name),
        slug: text(data.slug),
        description: text(data.description),
        itemKind: text(data.item_kind) || 'food',
        isDeal: data.is_deal === true,
        imageUrl: text(data.image_url),
        kitchenId: text(data.kitchen_id),
      }
    })
    .sort((left, right) => left.id.localeCompare(right.id))
  const dishIds = new Set(dishes.map((dish) => dish.id))

  return {
    dishes,
    menu: {
      id: menuSnapshot.id,
      name: text(menuSnapshot.data().name),
      status: text(menuSnapshot.data().status),
    },
    sections,
    menuItems,
    integrity: {
      dishDocumentIdMismatches: dishes
        .filter((dish) => dish.storedId && dish.storedId !== dish.id)
        .map((dish) => ({ documentId: dish.id, storedId: dish.storedId })),
      dishKitchenIdMismatches: dishes
        .filter((dish) => dish.kitchenId && dish.kitchenId !== target.kitchenId)
        .map((dish) => dish.id),
      danglingMenuItems: menuItems
        .filter((item) => !dishIds.has(item.dishId))
        .map((item) => ({
          sectionId: item.sectionId,
          itemId: item.id,
          dishId: item.dishId,
        })),
    },
  }
}

function text(value) {
  return String(value ?? '').trim()
}

function numberValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function array(value) {
  return Array.isArray(value) ? value : []
}

function bySortOrderThenId(left, right) {
  return left.sortOrder - right.sortOrder || left.id.localeCompare(right.id)
}
