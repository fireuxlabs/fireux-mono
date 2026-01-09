import type { Company } from '../../../../../../../models/objects/company.model.ts'

export namespace CompanyCard {
  export interface Pill {
    id?: string
    title: string
    subtitle?: string | null
  }

  export interface Cell extends Pill {
    website?: string | null
    formatted_address?: string | null
    avatar?: string | null
  }

  export type Card = Cell

  export type Profile = Company
}

export function useCompanyInterface() {
  function card(company: Company): CompanyCard.Card
  function card(company?: Company | null | undefined): CompanyCard.Card | null
  function card(company?: Company | null | undefined): CompanyCard.Card | null {
    return company ? cellProps(company) : null
  }

  const pillProps = (company?: Company | null): CompanyCard.Pill => ({
    id: company?.id,
    title: company?.name || 'Company',
    subtitle: company?.formatted_address ?? company?.website ?? null,
  })

  const cellProps = (company?: Company | null): CompanyCard.Cell => {
    const pill = pillProps(company)
    return {
      ...pill,
      website: company?.website ?? null,
      formatted_address: company?.formatted_address ?? null,
      avatar: company?.avatar ?? null,
    }
  }

  return { card, pillProps, cellProps }
}
