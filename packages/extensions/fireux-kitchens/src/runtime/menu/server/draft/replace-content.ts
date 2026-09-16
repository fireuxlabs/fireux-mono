import type { DocumentData } from 'firebase-admin/firestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverKitchenDishesTarget,
  serverKitchenMenuItemsTarget,
  serverKitchenMenuSectionsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { planKitchenMenuDraft } from './plan'

/** Apply content changes inside the caller's authorized transaction, after its reads. */
export function replaceKitchenMenuDraftContent(
  mutations: GuardedServerTransaction,
  input: {
    kitchenId: string
    menuId: string
    plannedSections: ReturnType<typeof planKitchenMenuDraft>['plannedSections']
    oldItems: Map<string, Set<string>>
    existingDishIds: Set<string>
  }
) {
  const { plannedSections, oldItems, existingDishIds } = input
  const dishes = serverKitchenDishesTarget(input.kitchenId)
  const plannedSectionIds = new Set(
    plannedSections.map((section) => section.sectionId)
  )
  for (const oldSectionId of oldItems.keys()) {
    if (plannedSectionIds.has(oldSectionId)) continue
    const items = serverKitchenMenuItemsTarget(
      input.kitchenId,
      input.menuId,
      oldSectionId
    )
    for (const itemId of oldItems.get(oldSectionId) || []) {
      mutations.delete(items, itemId)
    }
    mutations.delete(
      serverKitchenMenuSectionsTarget(input.kitchenId, input.menuId),
      oldSectionId
    )
  }

  const oldSectionIds = new Set(oldItems.keys())
  plannedSections.forEach((section) => {
    const sections = serverKitchenMenuSectionsTarget(
      input.kitchenId,
      input.menuId
    )
    const items = serverKitchenMenuItemsTarget(
      input.kitchenId,
      input.menuId,
      section.sectionId
    )
    if (oldSectionIds.has(section.sectionId)) {
      mutations.update(sections, section.sectionId, section.sectionData)
    } else {
      mutations.create(sections, section.sectionId, section.sectionData)
    }
    const plannedItemIds = new Set(section.items.map((item) => item.itemId))
    for (const oldItemId of oldItems.get(section.sectionId) || []) {
      if (!plannedItemIds.has(oldItemId)) mutations.delete(items, oldItemId)
    }
    section.items.forEach((item) => {
      if (oldItems.get(section.sectionId)?.has(item.itemId)) {
        mutations.update<DocumentData>(items, item.itemId, item.itemData)
      } else {
        mutations.create(items, item.itemId, item.itemData)
      }
    })
  })
  plannedSections
    .flatMap((section) => section.items)
    .forEach((item) => {
      if (existingDishIds.has(item.dishId)) {
        mutations.update(dishes, item.dishId, item.dishData)
      } else {
        mutations.create(dishes, item.dishId, item.dishData)
      }
    })
}
