// Concurrent edit — 2026-07-20 13:08 CEST — Driver kitchen access: enforce persisted App and Kitchen authority in one transaction.

import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import { UserAppStorage } from 'fireux-core/runtime/models/core/user.model.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type { DriverKitchenLink } from '../../models/driver.model.ts'
import {
  DRIVER_KITCHEN_LINK_LIMIT,
  type DriverKitchenAccessInput,
  type DriverKitchenAccessRelation,
  type DriverKitchenAccessResult,
} from '../../models/driver/kitchen-access.ts'
import { AppDriverStorage } from '../../models/driver.model.ts'
import { KitchenStorage } from '../../models/kitchen.model.ts'

type DriverKitchenAccessContext = {
  actorUid: string
  appId: string
  databaseId: string
  input: DriverKitchenAccessInput
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

function text(value: unknown, max = 1_500) {
  return String(value ?? '').trim().slice(0, max)
}

function strings(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map((entry) => text(entry)).filter(Boolean))]
}

function relation(value: unknown): DriverKitchenAccessRelation {
  return value === 'exclusive' || value === 'preferred'
    ? value
    : 'available'
}

function normalizeLinks(value: unknown, appId: string) {
  const links = new Map<string, DriverKitchenLink>()
  if (!Array.isArray(value)) return links

  for (const entry of value) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue
    const data = entry as Record<string, unknown>
    const kitchenId = text(data.kitchen_id)
    if (!kitchenId || kitchenId.includes('/')) continue
    links.set(kitchenId, {
      app_id: appId,
      kitchen_id: kitchenId,
      kitchen_slug: text(data.kitchen_slug, 200),
      kitchen_name: text(data.kitchen_name, 240),
      relation: relation(data.relation),
      active: data.active === true,
    })
  }

  return links
}

function kitchenPresentation(data: DocumentData) {
  const identity =
    data.identity && typeof data.identity === 'object' && !Array.isArray(data.identity)
      ? data.identity as Record<string, unknown>
      : {}
  return {
    slug: text(data.slug, 200),
    name: text(identity.display_name || data.display_name, 240),
  }
}

function sameValue(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export async function mutateDriverKitchenAccess(
  context: DriverKitchenAccessContext
): Promise<DriverKitchenAccessResult> {
  const { actorUid, appId, databaseId, input } = context
  const db = getRuntimeFirestore(databaseId)
  const appRef = db.collection(AppStorage.collection).doc(appId)
  const actorMembershipRef = appRef
    .collection(UserAppStorage.collection)
    .doc(actorUid)
  const targetMembershipRef = appRef
    .collection(UserAppStorage.collection)
    .doc(input.driver_id)
  const kitchenRef = appRef
    .collection(KitchenStorage.scopeCollection)
    .doc(input.kitchen_id)
  const rootKitchenRef = db
    .collection(KitchenStorage.rootCollection)
    .doc(input.kitchen_id)
  const driverRef = appRef
    .collection(AppDriverStorage.collection)
    .doc(input.driver_id)

  return db.runTransaction(async (transaction) => {
    const appSnapshot = await transaction.get(appRef)
    const actorMembershipSnapshot = await transaction.get(actorMembershipRef)
    const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
    const kitchenSnapshot = await transaction.get(kitchenRef)
    const rootKitchenSnapshot = await transaction.get(rootKitchenRef)
    const driverSnapshot = await transaction.get(driverRef)

    if (!appSnapshot.exists) fail(409, 'The runtime App record does not exist.')
    if (!kitchenSnapshot.exists || !rootKitchenSnapshot.exists) {
      fail(404, 'The Kitchen does not exist in this App.')
    }

    const actorMembership = actorMembershipSnapshot.data() ?? {}
    const actorRole = text(actorMembership.role, 20)
    const actorIsMember =
      actorMembershipSnapshot.exists &&
      (actorRole === 'admin' || actorRole === 'user')
    const actorIsAdmin = actorRole === 'admin'
    const actorIsKitchenOperator = strings(
      kitchenSnapshot.get('operator_ids')
    ).includes(actorUid)
    if (!actorIsMember || (!actorIsAdmin && !actorIsKitchenOperator)) {
      fail(403, 'App admin or Kitchen operator access is required.')
    }

    const targetMembershipRole = text(
      targetMembershipSnapshot.get('role'),
      20
    )
    if (
      !targetMembershipSnapshot.exists ||
      (targetMembershipRole !== 'admin' && targetMembershipRole !== 'user')
    ) {
      fail(409, 'The target Driver is not an App member.')
    }
    if (!driverSnapshot.exists) {
      fail(409, 'The target Driver profile does not exist in this App.')
    }

    const driver = driverSnapshot.data() ?? {}
    const rawLinks = Array.isArray(driver.kitchen_links)
      ? driver.kitchen_links
      : []
    const links = normalizeLinks(rawLinks, appId)
    if (links.size > DRIVER_KITCHEN_LINK_LIMIT) {
      fail(409, 'The Driver Kitchen link limit has been exceeded.')
    }

    const current = links.get(input.kitchen_id)
    if (input.action === 'grant') {
      if (!current && links.size >= DRIVER_KITCHEN_LINK_LIMIT) {
        fail(409, 'The Driver Kitchen link limit has been reached.')
      }
      const presentation = kitchenPresentation(rootKitchenSnapshot.data() ?? {})
      links.set(input.kitchen_id, {
        app_id: appId,
        kitchen_id: input.kitchen_id,
        kitchen_slug: presentation.slug,
        kitchen_name: presentation.name,
        relation: input.relation ?? current?.relation ?? 'available',
        active: true,
      })
    } else if (current) {
      links.set(input.kitchen_id, {
        ...current,
        app_id: appId,
        active: false,
      })
    }

    const nextLinks = [...links.values()]
    const activeKitchenIds = nextLinks
      .filter((link) => link.active)
      .map((link) => link.kitchen_id)
    const currentActiveKitchenIds = strings(driver.active_kitchen_ids)
    const changed =
      !sameValue(rawLinks, nextLinks) ||
      !sameValue(currentActiveKitchenIds, activeKitchenIds)

    if (changed) {
      transaction.update(driverRef, {
        kitchen_links: nextLinks,
        active_kitchen_ids: activeKitchenIds,
        updated: {
          at: FieldValue.serverTimestamp(),
          by: actorUid,
        },
      })
    }

    return {
      ok: true,
      action: input.action,
      app_id: appId,
      driver_id: input.driver_id,
      kitchen_id: input.kitchen_id,
      changed,
      active_kitchen_ids: activeKitchenIds,
    }
  })
}
