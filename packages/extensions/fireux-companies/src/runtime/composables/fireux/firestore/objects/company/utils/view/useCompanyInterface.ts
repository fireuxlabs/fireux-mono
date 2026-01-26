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
  function map(company: Company): CompanyCard.Card {
    const id = safeString(company.id).trim()
    const name = safeString(company.name)
    const website = safeString(company.website)
    const address = safeString((company as any)?.formatted_address)

    return {
      id,
      to: id ? `/companies/${id}` : '',

      avatarUrl: safeString((company as any)?.place_image),
      title: name,
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

  function searchText(company: Company): string {
    const name = safeString(company.name)
    const website = safeString(company.website)
    const id = safeString(company.id)
    return `${name} ${website} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
