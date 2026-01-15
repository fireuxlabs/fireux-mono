import type { Company } from '../../../../../../../models/objects/company.model'

export namespace CompanyCard {
  export type Card = {
    id: string
    to: string

    // Canon pill fields
    avatarUrl: string
    title: string
    subtitle: string

    name: string
    website: string
    badges: string[]
  }
}

export function useCompanyInterface() {
  function map(company: Company): CompanyCard.Card {
    return {
      id: company.id,
      to: `/companies/${encodeURIComponent(company.id)}`,

      avatarUrl: '',
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
