import type { DocumentData } from 'firebase-admin/firestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverKitchenItemsTarget,
  serverKitchenMenuItemsTarget,
  serverKitchenMenuSectionsTarget,
} from '../../../kitchen/server/mutation-targets'
import type { planKitchenMenuDraft } from './plan'

/** Apply content changes inside the caller's authorized transaction, after its reads. */
export function replaceKitchenMenuDraftContent(
  mutations: GuardedServerTransaction,
  input: {
    kitchenId: string
    menuId: string
    plannedSections: ReturnType<typeof planKitchenMenuDraft>['plannedSections']
    oldItems: Map<string, Set<string>>
    existingItemIds: Set<string>
  }
) {
  const { plannedSections, oldItems, existingItemIds } = input
  const dishes = serverKitchenItemsTarget(input.kitchenId)
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
    for (const entryId of oldItems.get(oldSectionId) || []) {
      mutations.delete(items, entryId)
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
    const plannedItemIds = new Set(section.items.map((item) => item.entryId))
    for (const oldItemId of oldItems.get(section.sectionId) || []) {
      if (!plannedItemIds.has(oldItemId)) mutations.delete(items, oldItemId)
    }
    section.items.forEach((item) => {
      if (oldItems.get(section.sectionId)?.has(item.entryId)) {
        mutations.update<DocumentData>(items, item.entryId, item.itemData)
      } else {
        mutations.create(items, item.entryId, item.itemData)
      }
    })
  })
  plannedSections
    .flatMap((section) => section.items)
    .forEach((item) => {
      if (existingItemIds.has(item.itemId)) {
        mutations.update(dishes, item.itemId, item.catalogueItemData)
      } else {
        mutations.create(dishes, item.itemId, item.catalogueItemData)
      }
    })
}
