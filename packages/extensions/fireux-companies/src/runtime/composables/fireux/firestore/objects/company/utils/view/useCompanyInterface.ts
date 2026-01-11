import type { Company } from '../../../../../../../models/objects/company.model'

export namespace CompanyCard {
  export type Card = {
    id: string
    to: string

    name: string
    website: string
    badges: string[]
  }
}

export function useCompanyInterface() {
  function map(company: Company): CompanyCard.Card {
    return {
      id: company.id,
      to: `/companies/${company.id}`,

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
