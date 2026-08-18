import { computed, type Ref } from 'vue'
import type { Portfolio } from '../../../../models/portfolio.model.ts'

export function usePortfolioComputed(
  portfolio?: Ref<Partial<Portfolio> | null | undefined>
) {
  const hasPortfolio = computed(() => Boolean(portfolio?.value?.id))
  const hasMissingName = computed(() =>
    !String(portfolio?.value?.name || '').trim()
  )
  const hasMissingSlug = computed(() =>
    !String(portfolio?.value?.slug || '').trim()
  )
  const isActive = computed(() => portfolio?.value?.status === 'active')
  const isArchived = computed(() => portfolio?.value?.status === 'archived')
  const displayStatus = computed(() =>
    isActive.value ? 'Active' : isArchived.value ? 'Archived' : 'Unknown'
  )
  const displayName = computed(() =>
    String(
      portfolio?.value?.name ||
        portfolio?.value?.slug ||
        portfolio?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(portfolio?.value?.image_url || '').trim()
  )
  const hasRegion = computed(() =>
    Boolean(String(portfolio?.value?.region_label || '').trim())
  )

  return {
    hasPortfolio,
    hasMissingName,
    hasMissingSlug,
    isActive,
    isArchived,
    displayStatus,
    displayName,
    displayImageUrl,
    hasRegion,
  }
}
