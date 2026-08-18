// Concurrent edit — 2026-07-20 13:12 CEST — Driver dispatch privacy: project beacons and write watch state behind server authorization.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: hydrate Driver presentation from canonical User before app transactions.

import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { AppStorage } from 'fireux-core/runtime/app/models/app.model'
import {
  AppUserStorage,
  UserStorage,
} from 'fireux-core/runtime/user/models/user.model'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverAppDriversTarget,
  serverAppUsersTarget,
  serverKitchenOrdersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { AppDriverStorage } from '../../models/driver.model.ts'
import {
  DriverDispatchVisibleStatuses,
  isDriverDispatchVisibleStatus,
  type DriverDispatchBeacon,
  type DriverDispatchPage,
  type DriverDispatchWatchInput,
  type DriverDispatchWatchResult,
} from '../../models/driver/dispatch.ts'
import { AppKitchenStorage } from '../../../kitchen/models/kitchen.model.ts'

const MAX_ACTIVE_KITCHENS = 50
const MAX_ORDERS_PER_KITCHEN = 20
const MAX_DISPATCHES = 100
const MAX_DRIVER_RESPONSES = 100

type DriverDispatchContext = {
  actorUid: string
  appId: string
  databaseId: string
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function text(value: unknown, max = 1_500) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function stringList(value: unknown, max = MAX_ACTIVE_KITCHENS) {
  if (!Array.isArray(value)) return []
  return [
    ...new Set(
      value
        .map((entry) => text(entry))
        .filter((entry) => entry && !entry.includes('/'))
    ),
  ].slice(0, max)
}

function quantity(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0
}

function iso(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }
  return ''
}

function isMembership(data: DocumentData | undefined) {
  return data?.role === 'admin' || data?.role === 'user'
}

function activeKitchenLinks(driver: DocumentData, appId: string) {
  const activeIds = new Set(stringList(driver.active_kitchen_ids))
  const links = new Map<string, { name: string; slug: string }>()
  if (!Array.isArray(driver.kitchen_links)) return links

  for (const value of driver.kitchen_links) {
    const link = record(value)
    const kitchenId = text(link.kitchen_id)
    if (
      !kitchenId ||
      !activeIds.has(kitchenId) ||
      link.active !== true ||
      text(link.app_id) !== appId
    ) {
      continue
    }
    links.set(kitchenId, {
      name: text(link.kitchen_name, 240),
      slug: text(link.kitchen_slug, 200),
    })
  }
  return links
}

async function requireDriver(context: DriverDispatchContext) {
  const db = getRuntimeFirestore(context.databaseId)
  const appRef = db.collection(AppStorage.collection).doc(context.appId)
  const membershipRef = appRef
    .collection(AppUserStorage.collection)
    .doc(context.actorUid)
  const driverRef = appRef
    .collection(AppDriverStorage.collection)
    .doc(context.actorUid)
  const [appSnapshot, membershipSnapshot, driverSnapshot] = await db.getAll(
    appRef,
    membershipRef,
    driverRef
  )
  if (!appSnapshot.exists) fail(409, 'The runtime App record does not exist.')
  if (!membershipSnapshot.exists || !isMembership(membershipSnapshot.data())) {
    fail(403, 'App membership is required for Driver dispatches.')
  }
  if (!driverSnapshot.exists) {
    fail(409, 'Create a Driver profile before viewing dispatches.')
  }
  return { db, appRef, driverRef, driver: driverSnapshot.data() ?? {} }
}

function dispatchBeacon(
  actorUid: string,
  kitchenId: string,
  kitchen: { name: string; slug: string },
  orderId: string,
  order: DocumentData
): DriverDispatchBeacon | null {
  if (
    order.order_type !== 'delivery' ||
    !isDriverDispatchVisibleStatus(order.status)
  ) {
    return null
  }
  const responses = record(order.driver_responses)
  const watching = record(responses[actorUid]).status === 'watching'
  const watcherCount = Object.values(responses).filter(
    (value) => record(value).status === 'watching'
  ).length
  const items = Array.isArray(order.items) ? order.items : []
  const itemCount = items.reduce(
    (total, value) => total + quantity(record(value).quantity),
    0
  )
  const createdAt = iso(record(order.created).at)

  return {
    id: orderId,
    kitchen: {
      id: kitchenId,
      name: kitchen.name,
      slug: kitchen.slug,
    },
    status: order.status,
    item_count: itemCount || items.length,
    watcher_count: watcherCount,
    watching,
    ...(createdAt ? { created_at: createdAt } : {}),
  }
}

export async function listDriverDispatches(
  context: DriverDispatchContext
): Promise<DriverDispatchPage> {
  const { appRef, driver } = await requireDriver(context)
  const kitchens = activeKitchenLinks(driver, context.appId)
  const pages = await Promise.all(
    [...kitchens.keys()].map(async (kitchenId) => {
      const page = await appRef
        .collection(AppKitchenStorage.collection)
        .doc(kitchenId)
        .collection('orders')
        .where('order_type', '==', 'delivery')
        .where('status', 'in', [...DriverDispatchVisibleStatuses])
        .limit(MAX_ORDERS_PER_KITCHEN)
        .get()
      return page.docs.flatMap((snapshot) => {
        const beacon = dispatchBeacon(
          context.actorUid,
          kitchenId,
          kitchens.get(kitchenId)!,
          snapshot.id,
          snapshot.data()
        )
        return beacon ? [beacon] : []
      })
    })
  )

  const items = pages
    .flat()
    .sort((left, right) =>
      String(right.created_at || '').localeCompare(
        String(left.created_at || '')
      )
    )
    .slice(0, MAX_DISPATCHES)
  return { items }
}

export async function watchDriverDispatch(
  context: DriverDispatchContext,
  input: DriverDispatchWatchInput
): Promise<DriverDispatchWatchResult> {
  await requireDriver(context)
  const userSnapshot = await getRuntimeIdentityFirestore()
    .collection(UserStorage.collection)
    .doc(context.actorUid)
    .get()
  if (!userSnapshot.exists) {
    fail(409, 'Create the canonical User before watching Driver dispatches.')
  }
  const user = userSnapshot.data() ?? {}
  const memberships = serverAppUsersTarget(context.appId)
  const drivers = serverAppDriversTarget(context.appId)
  const orders = serverKitchenOrdersTarget(context.appId, input.kitchen_id)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const membershipSnapshot = await mutations.read(
      memberships,
      context.actorUid
    )
    const driverSnapshot = await mutations.read(drivers, context.actorUid)
    const orderSnapshot = await mutations.read(orders, input.order_id)
    if (!membershipSnapshot.exists || !isMembership(membershipSnapshot.data)) {
      fail(403, 'App membership is required for Driver dispatches.')
    }
    if (!driverSnapshot.exists) fail(409, 'The Driver profile does not exist.')
    if (!orderSnapshot.exists)
      fail(404, 'The delivery dispatch does not exist.')

    const driver = driverSnapshot.data ?? {}
    const links = activeKitchenLinks(driver, context.appId)
    if (!links.has(input.kitchen_id)) {
      fail(403, 'An active Driver Kitchen grant is required.')
    }
    const order = orderSnapshot.data ?? {}
    if (
      order.order_type !== 'delivery' ||
      !isDriverDispatchVisibleStatus(order.status)
    ) {
      fail(409, 'This delivery is not open for Driver interest.')
    }

    const responses = record(order.driver_responses)
    const current = record(responses[context.actorUid])
    if (current.status === 'watching') {
      return {
        ok: true,
        changed: false,
        kitchen_id: input.kitchen_id,
        order_id: input.order_id,
      }
    }
    if (
      !Object.prototype.hasOwnProperty.call(responses, context.actorUid) &&
      Object.keys(responses).length >= MAX_DRIVER_RESPONSES
    ) {
      fail(409, 'This delivery has reached its Driver response limit.')
    }

    mutations.update<DocumentData>(orders, input.order_id, {
      driver_responses: {
        ...responses,
        [context.actorUid]: {
          status: 'watching',
          driver_id: context.actorUid,
          driver_name: text(user.display_name, 120),
          avatar_url: text(user.avatar, 2_048),
          updated_at: FieldValue.serverTimestamp(),
        },
      },
      updated: {
        at: FieldValue.serverTimestamp(),
        by: context.actorUid,
      },
    })

    return {
      ok: true,
      changed: true,
      kitchen_id: input.kitchen_id,
      order_id: input.order_id,
    }
  })
}
