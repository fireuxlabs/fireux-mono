import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Kitchen } from '../../../../../../../models/objects/kitchen.model'

export namespace KitchenCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    title: string
    subtitle: string

    name: string
    website: string

    // Status/label chips
    badges: string[]
  }
}

export function useKitchenInterface() {
  type KitchenPill = KitchenCard.Card

  type KitchenCell = Pick<KitchenCard.Card, 'to' | 'name' | 'website' | 'badges'> & {
    avatarUrl: string
    prop?: string
  }

  type KitchenPreview = {
    avatarUrl: string
    name: string
    website: string
    badges: string[]
    prop?: string
  }

  type KitchenProfile = {
    card: KitchenCard.Card
    title: string
    subtitle: string
    avatarUrl?: string
    prop?: string
    website?: string
    address?: string
  }

  function map(kitchen: Kitchen): KitchenCard.Card {
    const id = safeString(kitchen.id).trim()
    const name = safeString(kitchen.name)
    const shortName = safeString((kitchen as any)?.short_name)
    const website = safeString(kitchen.website)
    const shortAddress = safeString((kitchen as any)?.short_address)
    const formattedAddress = safeString((kitchen as any)?.formatted_address)
    const address = shortAddress || formattedAddress

    return {
      id,
      to: id ? `/kitchens/${encodeURIComponent(id)}` : '',

      avatarUrl: safeString((kitchen as any)?.image_url),
      title: shortName || name,
      subtitle: address,

      name,
      website,

      badges: [],
    }
  }

  function card(target?: Kitchen | null | undefined): KitchenCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: Kitchen | null | undefined): KitchenPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title || base.name,
      subtitle: base.subtitle || '',
    }
  }

  function cell(target?: Kitchen | null | undefined): KitchenCell | null {
    const base = card(target)
    if (!base || !target) return null
    const address = safeString((target as any)?.short_address || (target as any)?.formatted_address)
    return {
      to: base.to,
      name: base.name,
      website: base.website,
      badges: base.badges,
      avatarUrl: base.avatarUrl,
      prop: address,
    }
  }

  function preview(target?: Kitchen | null | undefined): KitchenPreview | null {
    const base = card(target)
    if (!base || !target) return null
    const address = safeString((target as any)?.short_address || (target as any)?.formatted_address)
    return {
      avatarUrl: base.avatarUrl,
      name: base.name,
      website: base.website,
      badges: base.badges,
      prop: address,
    }
  }

  function profile(target?: Kitchen | null | undefined): KitchenProfile | null {
    const base = card(target)
    if (!base || !target) return null
    const address = safeString((target as any)?.short_address || (target as any)?.formatted_address)
    return {
      card: base,
      title: base.title,
      subtitle: base.subtitle,
      avatarUrl: base.avatarUrl,
      prop: base.website,
      website: base.website,
      address,
    }
  }

  function searchText(kitchen: Kitchen): string {
    const name = safeString(kitchen.name)
    const website = safeString(kitchen.website)
    const id = safeString(kitchen.id)
    return `${name} ${website} ${id}`.trim().toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
