import type { Company } from '../../../../../../models/objects/company.model'

export namespace CompanyCard {
  export interface Pill {
    id?: string
    title: string
    subtitle?: string | null
  }

  export interface Cell extends Pill {
    website?: string | null
  }

  export type Profile = Company
}

export function useCompanyInterface() {
  const pillProps = (company?: Company | null): CompanyCard.Pill => ({
    id: company?.id,
    title: company?.name || 'Company',
    subtitle: company?.website ?? null,
  })

  const cellProps = (company?: Company | null): CompanyCard.Cell => {
    const pill = pillProps(company)
    return {
      ...pill,
      website: company?.website ?? null,
    }
  }

  return { pillProps, cellProps }
}
