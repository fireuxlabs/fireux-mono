import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Company } from '../../../../../../../models/objects/company.model'

export namespace CompanyCard {
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

export function useCompanyInterface() {
  type CompanyPill = CompanyCard.Card

  type CompanyCell = Pick<CompanyCard.Card, 'to' | 'name' | 'website' | 'badges'> & {
    avatarUrl: string
    prop?: string
  }

  type CompanyPreview = {
    avatarUrl: string
    name: string
    website: string
    badges: string[]
    prop?: string
  }

  type CompanyProfile = {
    card: CompanyCard.Card
    title: string
    subtitle: string
    avatarUrl?: string
    prop?: string
    website?: string
    address?: string
  }

  function map(company: Company): CompanyCard.Card {
    const id = safeString(company.id).trim()
    const name = safeString(company.name)
    const shortName = safeString((company as any)?.short_name)
    const website = safeString(company.website)
    const shortAddress = safeString((company as any)?.short_address)
    const formattedAddress = safeString((company as any)?.formatted_address)
    const address = shortAddress || formattedAddress

    return {
      id,
      to: id ? `/companies/${encodeURIComponent(id)}` : '',

      avatarUrl: safeString((company as any)?.image_url || (company as any)?.place_image),
      title: shortName || name,
      subtitle: address,

      name,
      website,

      badges: [],
    }
  }

  function card(target?: Company | null | undefined): CompanyCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function pill(target?: Company | null | undefined): CompanyPill | null {
    const base = card(target)
    if (!base) return null
    return {
      ...base,
      title: base.title || base.name,
      subtitle: base.subtitle || '',
    }
  }

  function cell(target?: Company | null | undefined): CompanyCell | null {
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

  function preview(target?: Company | null | undefined): CompanyPreview | null {
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

  function profile(target?: Company | null | undefined): CompanyProfile | null {
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

  function searchText(company: Company): string {
    const name = safeString(company.name)
    const website = safeString(company.website)
    const id = safeString(company.id)
    return `${name} ${website} ${id}`.trim().toLowerCase()
  }

  return { card, pill, cell, preview, profile, searchText }
}
