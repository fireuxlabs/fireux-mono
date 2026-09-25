import { createError } from 'h3'
import { requireAvailableMenuSlug } from '../name'
import { requireMenuCreationCapacity } from '../workspace-commands'
import {
  requireKitchenMutationAuthority,
  type readKitchenMutationActor,
} from '../../../kitchen/server/core/mutation-authority'
import { KitchenMenuStorage as MenuStorage } from '../../utils/kitchen-menu.ts'
import type { DocumentData } from 'firebase-admin/firestore'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverKitchenDishesTarget,
  serverKitchenMenusTarget,
  serverKitchenMenuItemsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { normalizeKitchenMenuDraftSections } from './sections'
import { planKitchenMenuDraft } from './plan'
import { replaceKitchenMenuDraftContent } from './replace-content'
import { syncKitchenMenuDirectory } from '../directory/sync'

type DraftSections = ReturnType<typeof normalizeKitchenMenuDraftSections>

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const titleFromId = (value: string) =>
  value
    .split(/[-_\s]+/g)
    .map((part) => (part ? `${part[0]?.toUpperCase()}${part.slice(1)}` : ''))
    .filter(Boolean)
    .join(' ')
export async function writeKitchenMenuDraft(input: {
  appId: string
  kitchenId: string
  kitchenPath: string
  menuId: string
  uid: string
  actor: Awaited<ReturnType<typeof readKitchenMutationActor>>
  sections: DraftSections
}) {
  const db = getRuntimeFirestore()
  const menuRef = db.doc(
    `${input.kitchenPath}/${MenuStorage.scopeCollection}/${input.menuId}`
  )
  const oldSectionsSnap = await menuRef.collection('sections').get()
  const oldItems = new Map<string, Set<string>>()
  await Promise.all(
    oldSectionsSnap.docs.map(async (sectionDoc) => {
      const items = await sectionDoc.ref.collection('items').get()
      oldItems.set(sectionDoc.id, new Set(items.docs.map((item) => item.id)))
    })
  )

  const stamp = serverAuditStamp({ by: input.uid, appId: input.appId })
  const { plannedSections, sproochliCacheUnits } = planKitchenMenuDraft(
    input,
    stamp
  )
  const menus = serverKitchenMenusTarget(input.kitchenId)
  const dishes = serverKitchenDishesTarget(input.kitchenId)
  const write = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const menu = await mutations.read(menus, input.menuId)
      const access = !menu.exists
        ? await requireMenuCreationCapacity(
            mutations,
            input.actor,
            input.kitchenId
          )
        : await requireKitchenMutationAuthority(
            mutations,
            input.actor,
            input.kitchenId
          )
      const existing = record(menu.data || {})
      // Recheck inside the transaction: import cannot restore placement-owned
      // terms after explicit commercial adoption, including a concurrent bind.
      const sectionIds = new Set([
        ...oldItems.keys(),
        ...plannedSections.map((section) => section.sectionId),
      ])
      for (const sectionId of sectionIds) {
        const ids = [
          ...new Set([
            ...(oldItems.get(sectionId) || []),
            ...(plannedSections
              .find((section) => section.sectionId === sectionId)
              ?.items.map((item) => item.itemId) || []),
          ]),
        ]
        const items = await mutations.readMany(
          serverKitchenMenuItemsTarget(
            input.kitchenId,
            input.menuId,
            sectionId
          ),
          ids
        )
        if (items.some((item) => item.data?.sellable_id))
          throw createError({
            statusCode: 409,
            statusMessage:
              'This menu uses shared sellables. Import replacement requires a reviewed commercial mapping.',
          })
      }
      const status = text(existing.status) || 'draft'
      const description = text(existing.description)
      let name =
        text(existing.name) || titleFromId(input.menuId) || input.menuId
      const slug = menu.exists ? text(existing.slug) : normalizeSlug(name)
      if (!slug)
        throw createError({
          statusCode: 409,
          statusMessage: 'Menu slug is required before importing content.',
        })
      if (!menu.exists) {
        if (access.subscription === 'free') {
          if (slug !== 'food' && slug !== 'drinks')
            throw createError({
              statusCode: 403,
              statusMessage:
                'Choose an existing Food or Drinks Menu. Creating a custom Menu requires Plus.',
            })
          name = slug === 'food' ? 'Food' : 'Drinks'
        }
        await requireAvailableMenuSlug(mutations, input.kitchenId, slug)
      }
      const menuData: Record<string, unknown> = {
        name,
        slug,
        status,
        sort_order: Number(existing.sort_order || 0),
        created: record(existing.created).at ? existing.created : stamp,
        updated: stamp,
        ...(description ? { description } : {}),
      }
      const plannedDishes = plannedSections.flatMap((section) => section.items)
      const dishSnapshots = await mutations.readMany(
        dishes,
        plannedDishes.map((item) => item.dishId)
      )

      if (menu.exists)
        mutations.update<DocumentData>(menus, input.menuId, menuData)
      else mutations.create(menus, input.menuId, menuData)

      replaceKitchenMenuDraftContent(mutations, {
        kitchenId: input.kitchenId,
        menuId: input.menuId,
        plannedSections,
        oldItems,
        existingDishIds: new Set(
          plannedDishes
            .filter((_, index) => dishSnapshots[index]?.exists)
            .map((item) => item.dishId)
        ),
      })
      return { menuData, status, existed: menu.exists }
    }
  )
  // Public menu index seam: scoped menu content must also have a root /menus row.
  const root = await syncKitchenMenuDirectory({
    appId: input.appId,
    kitchenId: input.kitchenId,
    menuId: input.menuId,
    uid: input.uid,
  })

  return {
    menu_written: true,
    root_menu_id: root.id,
    root_menu_path: root.path,
    action: write.existed ? 'replaced-draft' : 'created-draft',
    status: write.status,
    sections_count: input.sections.length,
    items_count: plannedSections.reduce(
      (count, section) => count + section.items.length,
      0
    ),
    dish_targets: plannedSections.flatMap((section, sectionIndex) =>
      section.items.map((item, itemIndex) => ({
        review_key: `${sectionIndex}:${itemIndex}`,
        dish_id: item.dishId,
      }))
    ),
    sproochliCacheUnits,
  }
}
