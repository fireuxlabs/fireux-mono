// Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: expose canonical Delivery address and timing in customer projection.
// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: recover source item identity for signed-in amend resubmission.
// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: join the concrete Place runtime model and omit absent customer Order values.
import { getQuery, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { CustomerOrderPage } from '../../../models/customer/order.model.ts'
import { readCustomerOrderKitchens, kitchenKey } from './kitchens'
import { projectCustomerOrderSummary } from './projection'

const PAGE_SIZE = 24
const ORDER_PATH = /^apps\/([^/]+)\/kitchens\/([^/]+)\/orders\/([^/]+)$/

export async function readCustomerOrders(
  event: H3Event
): Promise<CustomerOrderPage> {
  const { uid } = await requireFirebaseBearerUser(event)
  const db = getRuntimeFirestore()
  const { appId } = useFireUXConfig()
  const links = db.collection(`users/${uid}/orders`)
  const cursor = text(getQuery(event).cursor)
  let query = links.orderBy('created_at', 'desc').limit(PAGE_SIZE)

  if (cursor) {
    const cursorSnap = await links.doc(cursor).get()
    if (cursorSnap.exists) query = query.startAfter(cursorSnap)
  }

  const page = await query.get()
  const candidates = page.docs.flatMap((linkSnap) => {
    const link = linkSnap.data()
    const orderPath = text(link.order_path)
    const match = orderPath.match(ORDER_PATH)
    if (!match || match[1] !== appId || match[3] !== linkSnap.id) return []

    return [
      {
        linkId: linkSnap.id,
        link,
        orderRef: db.doc(orderPath),
      },
    ]
  })
  const orderSnaps = candidates.length
    ? await db.getAll(...candidates.map((candidate) => candidate.orderRef))
    : []
  const kitchens = await readCustomerOrderKitchens(
    db,
    candidates.map((candidate) => candidate.link)
  )
  const items = candidates.flatMap((candidate, index) => {
    const orderSnap = orderSnaps[index]
    if (!orderSnap?.exists) return []

    const summary = projectCustomerOrderSummary(
      uid,
      candidate.linkId,
      candidate.link,
      orderSnap.data(),
      kitchens.get(kitchenKey(candidate.link))
    )
    return summary ? [summary] : []
  })

  return {
    items,
    nextCursor: page.size === PAGE_SIZE ? page.docs.at(-1)?.id || null : null,
    ...(import.meta.dev
      ? {
          debug: {
            customer_uid: uid,
            link_count: page.size,
            candidate_count: candidates.length,
            resolved_order_count: orderSnaps.filter(
              (snapshot) => snapshot.exists
            ).length,
            visible_order_count: items.length,
            omitted_count: page.size - items.length,
            statuses: items.map((item) => ({
              id: item.id,
              status: item.status,
              order_type: item.order_type,
            })),
          },
        }
      : {}),
  }
}

function text(value: unknown) {
  return String(value ?? '').trim()
}
