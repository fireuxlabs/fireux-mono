// Concurrent edit — 2026-07-20 13:08 CEST — Driver kitchen access: enforce persisted App and Kitchen authority in one transaction.

import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
  serverKitchenTeamMembersTarget,
  serverUserProfileAppStateTarget,
  serverUserProfileTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { DriverKitchenLink } from '../../utils/driver.ts'
import {
  DRIVER_KITCHEN_LINK_LIMIT,
  type DriverKitchenAccessInput,
  type DriverKitchenAccessRelation,
  type DriverKitchenAccessResult,
} from '../../models/driver/kitchen-access.ts'

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
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

function strings(value: unknown) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map((entry) => text(entry)).filter(Boolean))]
}

function relation(value: unknown): DriverKitchenAccessRelation {
  return value === 'exclusive' || value === 'preferred' ? value : 'available'
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
    data.identity &&
    typeof data.identity === 'object' &&
    !Array.isArray(data.identity)
      ? (data.identity as Record<string, unknown>)
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
  const { actorUid, appId, input } = context
  void context.databaseId
  const memberships = serverAppUsersTarget(appId)
  const team = serverKitchenTeamMembersTarget(input.kitchen_id)

  const kitchenData = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const [
        appSnapshot,
        actorMembershipSnapshot,
        targetMembershipSnapshot,
        kitchenSnapshot,
        actorTeamSnapshot,
      ] = await Promise.all([
        mutations.read(FIRESTORE_MUTATION_TARGETS.runtimeApps, appId),
        mutations.read(memberships, actorUid),
        mutations.read(memberships, input.driver_id),
        mutations.read(FIRESTORE_MUTATION_TARGETS.kitchens, input.kitchen_id),
        mutations.read(team, actorUid),
      ])

      if (!appSnapshot.exists)
        fail(409, 'The runtime App record does not exist.')
      if (!kitchenSnapshot.exists) fail(404, 'The Kitchen does not exist.')

      const actorRole = text(actorMembershipSnapshot.data?.role, 20)
      if (
        !actorMembershipSnapshot.exists ||
        (actorRole !== 'admin' && actorRole !== 'user')
      ) {
        fail(403, 'App membership is required.')
      }
      const teamRole = text(actorTeamSnapshot.data?.role, 20)
      if (
        !actorTeamSnapshot.exists ||
        text(actorTeamSnapshot.data?.user_id) !== actorUid ||
        actorTeamSnapshot.data?.status !== 'active' ||
        (teamRole !== 'owner' && teamRole !== 'operator')
      ) {
        fail(403, 'Kitchen owner or operator access is required.')
      }

      const targetRole = text(targetMembershipSnapshot.data?.role, 20)
      if (
        !targetMembershipSnapshot.exists ||
        (targetRole !== 'admin' && targetRole !== 'user')
      ) {
        fail(409, 'The target Driver is not an App member.')
      }
      return kitchenSnapshot.data ?? {}
    }
  )

  const profiles = serverUserProfileTarget(
    input.driver_id,
    'driver',
    'identity'
  )
  const appStates = serverUserProfileAppStateTarget(
    input.driver_id,
    'driver',
    appId,
    'identity'
  )
  return runGuardedServerTransaction(
    { kind: 'identity' },
    async (mutations) => {
      const [profileSnapshot, driverSnapshot] = await Promise.all([
        mutations.read(profiles, 'driver'),
        mutations.read(appStates, appId),
      ])
      if (!profileSnapshot.exists || !driverSnapshot.exists) {
        fail(409, 'The target Driver profile is not ready for this App.')
      }

      const driver = driverSnapshot.data ?? {}
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
        const presentation = kitchenPresentation(kitchenData)
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
        mutations.update(appStates, appId, {
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
    }
  )
}
