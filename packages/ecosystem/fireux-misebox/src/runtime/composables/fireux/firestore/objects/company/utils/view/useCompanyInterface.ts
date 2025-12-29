import type { Company } from '../../../../../../models/objects/company.model'

export interface CompanyCell {
  id: string
  title: string
  subtitle?: string
}

export function useCompanyInterface() {
  const toCell = (company: Company): CompanyCell => ({
    id: company.id,
    title: company.name,
    subtitle: company.description,
  })

  return { toCell }
}
