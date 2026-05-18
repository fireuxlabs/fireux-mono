import { computed, type Ref } from 'vue'
import type { CompanyHydrated } from '../../fetch/types'

export function useCompanyComputed(
  company?: Ref<CompanyHydrated | null | undefined>
) {
  const hasCompany = computed(() => Boolean(company?.value?.id))
  const companyTitle = computed(() =>
    String(
      company?.value?.short_name ||
        company?.value?.name ||
        company?.value?.id ||
        ''
    ).trim()
  )
  const companySubtitle = computed(() =>
    String(
      company?.value?.short_address ||
        company?.value?.formatted_address ||
        ''
    ).trim()
  )

  return {
    hasCompany,
    companyTitle,
    companySubtitle,
  }
}
