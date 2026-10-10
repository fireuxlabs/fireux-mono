import type { DriverKitchenLink } from '../../models/driver.model'
import {
  DRIVER_KITCHEN_LINK_LIMIT,
  type DriverKitchenAccessInput,
  type DriverKitchenAccessRelation,
} from '../../models/driver/kitchen-access'

type DriverKitchenLinkChange =
  | { ok: false; reason: 'exceeded' | 'reached' }
  | {
      ok: true
      links: DriverKitchenLink[]
      activeKitchenIds: string[]
      changed: boolean
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

function kitchenPresentation(data: Record<string, unknown>) {
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

/** Calculate a Driver-owned link change; callers retain authority and persistence. */
export function planDriverKitchenLinks(
  driver: Record<string, unknown>,
  appId: string,
  input: DriverKitchenAccessInput,
  kitchenData: Record<string, unknown>
): DriverKitchenLinkChange {
  const rawLinks = Array.isArray(driver.kitchen_links)
    ? driver.kitchen_links
    : []
  const links = normalizeLinks(rawLinks, appId)
  if (links.size > DRIVER_KITCHEN_LINK_LIMIT) {
    return { ok: false, reason: 'exceeded' }
  }

  const current = links.get(input.kitchen_id)
  if (input.action === 'grant') {
    if (!current && links.size >= DRIVER_KITCHEN_LINK_LIMIT) {
      return { ok: false, reason: 'reached' }
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

  return { ok: true, links: nextLinks, activeKitchenIds, changed }
}
