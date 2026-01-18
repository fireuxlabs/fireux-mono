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
    return {
      id: company.id,
      to: `/companies/${encodeURIComponent(company.id)}`,

      avatarUrl: company.place_image ?? '',
      title: company.name,
      subtitle: company.website,

      name: company.name,
      website: company.website,

      badges: [],
    }
  }

  function card(target?: Company | null | undefined): CompanyCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(company: Company): string {
    return `${company.name} ${company.website} ${company.id}`.toLowerCase()
  }

  return { card, searchText }
}
