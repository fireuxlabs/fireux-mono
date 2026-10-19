import { readOpeningHoursStatus } from 'fireux-places/runtime/place/utils/opening-hours-status'
import {
  promotionPricedItem,
  promotionDay,
  promotionDays,
} from '../../kitchen/utils/promotions/pricing'
import type {
  MenuManifest,
  MenuManifestItem,
} from '../models/menu-detail.model'
import type { KitchenPublicOffering } from '../../kitchen/models/public-offering.model'

export type MenuServiceSource = {
  manifest: MenuManifest
  offerings: KitchenPublicOffering[]
}
export type MenuServiceOffer = {
  source: { kitchenId: string; menuId: string; menuSlug?: string; sectionId: string }
  item: MenuManifestItem
  presentation: MenuManifest['presentation']
  offerings: KitchenPublicOffering[]
  label: string
}
export type MenuServiceItem = MenuServiceOffer & {
  key: string
  alternatives: MenuServiceOffer[]
}
export type MenuServiceSection = {
  key: string
  label: string
  items: MenuServiceItem[]
  offerings: KitchenPublicOffering[]
}
type Candidate = MenuServiceOffer & {
  rank: number
  promoted: boolean
  menuId: string
}

function servingDay(offering: KitchenPublicOffering, now: Date) {
  const timezone = offering.hours?.timezone || ''
  const status = readOpeningHoursStatus(offering.hours, timezone, now)
  const today = promotionDays.indexOf(
    promotionDay(timezone, now) as (typeof promotionDays)[number]
  )
  if (offering.collection_timing === 'next_day' && today >= 0 && status.known) {
    for (let offset = 1; offset <= 7; offset++) {
      const day = promotionDays[(today + offset) % 7]!
      if (offering.hours?.windows.some((window) => window.days.includes(day)))
        return { day, rank: offset * 1440 }
    }
    return { day: '', rank: Number.MAX_SAFE_INTEGER }
  }
  if (today < 0 || !status.known)
    return { day: '', rank: Number.MAX_SAFE_INTEGER }
  if (status.open) return { day: promotionDays[today]!, rank: 0 }
  if (status.nextInMinutes === null)
    return { day: '', rank: Number.MAX_SAFE_INTEGER }
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const minute =
    Number(parts.find((part) => part.type === 'hour')?.value) * 60 +
    Number(parts.find((part) => part.type === 'minute')?.value)
  const offset = Math.floor((minute + status.nextInMinutes) / 1440)
  return {
    day: promotionDays[(today + offset) % 7]!,
    rank: status.nextInMinutes + 1,
  }
}
const termsKey = (offer: MenuServiceOffer) =>
  JSON.stringify([
    offer.presentation.currencyCode,
    offer.item.price,
    offer.item.priceOptions,
    offer.item.addOns,
    offer.item.bottleDeposit,
    offer.item.mealDeal?.groups,
  ])

/** One Dish card retains distinct commercial offers; current/next serving time owns the displayed price. */
export function serviceSections(
  sources: MenuServiceSource[],
  now = new Date()
): MenuServiceSection[] {
  const servingTimes = new Map<string, ReturnType<typeof servingDay>>()
  const sections = new Map<
    string,
    { key: string; label: string; identities: string[] }
  >()
  const candidates = new Map<string, Candidate[]>()
  for (const { manifest, offerings } of sources) {
    if (
      !offerings.length ||
      manifest.content.audience ||
      manifest.content.daily
    )
      continue
    for (const section of manifest.content.sections) {
      const key = section.label.trim().toLocaleLowerCase()
      for (const item of section.items) {
        const identity = `${manifest.source.kitchenId}:${item.mealDeal ? `deal:${item.mealDeal.promotionId}` : item.dishId || `${manifest.source.menuId}:${section.id}:${item.id}`}`
        if (!candidates.has(identity)) {
          candidates.set(identity, [])
          if (!sections.has(key))
            sections.set(key, { key, label: section.label, identities: [] })
          sections.get(key)!.identities.push(identity)
        }
        for (const offering of offerings) {
          const scheduleKey = JSON.stringify([offering.id, offering.hours])
          if (!servingTimes.has(scheduleKey))
            servingTimes.set(scheduleKey, servingDay(offering, now))
          const { day, rank } = servingTimes.get(scheduleKey)!
          if (item.mealDeal && !item.mealDeal.days.includes(day)) continue
          const priced = promotionPricedItem(
            item,
            manifest.content.promotions,
            day
          )
          candidates.get(identity)!.push({
            source: {
              kitchenId: manifest.source.kitchenId,
              menuId: manifest.source.menuId,
              ...(manifest.source.menuSlug ? { menuSlug: manifest.source.menuSlug } : {}),
              sectionId: section.id,
            },
            item: priced.item,
            presentation: manifest.presentation,
            offerings: [offering],
            label:
              priced.promotion ||
              manifest.content.name ||
              manifest.source.menuId,
            rank,
            promoted: Boolean(priced.promotion),
            menuId: manifest.source.menuId,
          })
        }
      }
    }
  }
  return [...sections.values()]
    .map((section) => {
      const items = section.identities
        .filter((key) => candidates.get(key)!.length)
        .map((key) => {
          const sorted = candidates
            .get(key)!
            .sort(
              (a, b) =>
                a.rank - b.rank ||
                Number(b.promoted) - Number(a.promoted) ||
                a.menuId.localeCompare(b.menuId)
            )
          const offers: MenuServiceOffer[] = []
          for (const candidate of sorted) {
            const existing = offers.find(
              (offer) => termsKey(offer) === termsKey(candidate)
            )
            if (existing) {
              for (const offering of candidate.offerings)
                if (!existing.offerings.some((row) => row.id === offering.id))
                  existing.offerings.push(offering)
            } else
              offers.push({
                source: candidate.source,
                item: candidate.item,
                presentation: candidate.presentation,
                offerings: [...candidate.offerings],
                label: candidate.label,
              })
          }
          return { key, ...offers[0]!, alternatives: offers.slice(1) }
        })
      const first = items[0]?.offerings || []
      const sameHours = items.every(
        (row) =>
          !row.alternatives.length &&
          row.offerings.length === first.length &&
          row.offerings.every((offering) =>
            first.some((candidate) => candidate.id === offering.id)
          )
      )
      return {
        key: section.key,
        label: section.label,
        items,
        offerings: sameHours ? first : [],
      }
    })
    .filter((section) => section.items.length)
}
