import { isDeepStrictEqual } from 'node:util'
import { createError } from 'h3'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenMenusTarget,
  serverKitchenFulfilmentTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { MenuTarget } from '../ownership/target-types'
import { readKitchenFulfilmentConfig } from '../../../kitchen/utils/kitchen-readers'
import type { MenuOrderContext } from './context'
import { menuSourceFromData } from '../payload/source'

type Target = Parameters<GuardedServerTransaction['read']>[0]
type Row = { id: string; data: Record<string, unknown> }
export type MenuOrderReadObserver = {
  document(
    target: Target,
    id: string,
    data: Record<string, unknown> | undefined
  ): void
  collection(target: Target, rows: Row[]): void
}
const changed = () =>
  createError({
    statusCode: 409,
    statusMessage: 'Menu ordering changed. Review the menu and try again.',
  })
const assertSame = (left: unknown, right: unknown) => {
  if (!isDeepStrictEqual(left, right)) throw changed()
}
const sorted = (rows: Row[]) =>
  [...rows].sort((a, b) => a.id.localeCompare(b.id))

/** Captures the actual Menu pricing reads, including complete collection membership. */
export function menuOrderReadSet() {
  const reads: Array<(tx: GuardedServerTransaction) => Promise<void>> = []
  const observer: MenuOrderReadObserver = {
    document(target, id, data) {
      reads.push(async (tx) => {
        const current = await tx.read(target, id)
        assertSame(current.exists ? current.data : undefined, data)
      })
    },
    collection(target, rows) {
      const expected = sorted(rows)
      reads.push(async (tx) => {
        const current: Row[] = []
        let after: string | undefined
        for (;;) {
          const page = await tx.readAll(target, 1000, after)
          current.push(...page)
          if (page.length < 1000) break
          after = page.at(-1)!.id
        }
        assertSame(sorted(current), expected)
      })
    },
  }
  return {
    observer,
    validate: async (tx: GuardedServerTransaction) => {
      for (const read of reads) await read(tx)
    },
  }
}

/** Validate the resolved doorway and the policy snapshot before any order write. */
export async function prepareMenuOrderContextGuard(
  context: MenuOrderContext,
  target: MenuTarget
) {
  if (!target.orderingSource)
    throw new Error('Menu ordering source snapshot is missing.')
  const reads = menuOrderReadSet()
  reads.observer.document(
    FIRESTORE_MUTATION_TARGETS.kitchens,
    context.kitchenId,
    target.orderingSource.kitchen
  )
  reads.observer.document(
    serverKitchenMenusTarget(context.kitchenId),
    context.menuId,
    context.menuData
  )
  if (target.kind === 'root-doorway')
    reads.observer.document(
      FIRESTORE_MUTATION_TARGETS.menus,
      target.routeMenuId,
      target.rootMenuData
    )

  return async (tx: GuardedServerTransaction) => {
    await reads.validate(tx)
    const place = await tx.read(
      FIRESTORE_MUTATION_TARGETS.places,
      context.kitchenPlaceId
    )
    assertSame(place.data || {}, target.orderingSource!.place)
    const policy = await tx.read(
      serverKitchenFulfilmentTarget(context.kitchenId),
      'policy'
    )
    const fulfilment = policy.exists
      ? readKitchenFulfilmentConfig(policy.data)
      : { delivery_zones: [], payment_methods: [] }
    assertSame(
      fulfilment.delivery_zones.length || fulfilment.payment_methods.length
        ? fulfilment
        : undefined,
      context.fulfilment
    )
    if (target.kind !== 'root-doorway') {
      const menus = await tx.query(
        serverKitchenMenusTarget(context.kitchenId),
        {
          field: 'slug',
          op: '==',
          value: target.routeMenuId,
          limit: 2,
        }
      )
      assertSame(
        menus.map((row) => row.id),
        [context.menuId]
      )
    }
    const rootSource =
      target.kind === 'root-doorway'
        ? menuSourceFromData(target.rootMenuData)
        : undefined
    const routedKitchenSlug =
      target.kind === 'directory-menu'
        ? target.kitchenSlug
        : rootSource && !rootSource.kitchen_id
          ? rootSource.kitchen_slug
          : undefined
    if (routedKitchenSlug) {
      const kitchens = await tx.query(FIRESTORE_MUTATION_TARGETS.kitchens, {
        field: 'slug',
        op: '==',
        value: routedKitchenSlug.trim().toLowerCase(),
        limit: 2,
      })
      assertSame(
        kitchens.map((row) => row.id),
        [context.kitchenId]
      )
    }
    if (target.kind === 'tenant-menu') {
      // Guarded queries support one predicate; page the App matches then apply
      // the same management-mode predicate, retaining ambiguity detection.
      const matches: string[] = []
      let after: string | undefined
      for (;;) {
        const page = await tx.query(FIRESTORE_MUTATION_TARGETS.kitchens, {
          field: 'management.app_id',
          op: '==',
          value: context.appId,
          limit: 100,
          afterId: after,
        })
        for (const row of page) {
          if (
            (row.data.management as { mode?: unknown } | undefined)?.mode ===
            'app'
          )
            matches.push(row.id)
        }
        if (page.length < 100) break
        after = page.at(-1)!.id
      }
      assertSame(matches, [context.kitchenId])
    }
  }
}
