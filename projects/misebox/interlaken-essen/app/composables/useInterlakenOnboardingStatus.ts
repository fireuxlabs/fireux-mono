import type {
  MarketplaceAccountResponse,
  MarketplaceOnboardingStatus,
} from '@/content/marketplace-profile'
import { useState } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

export function useInterlakenOnboardingStatus() {
  const { currentUser } = useAuth()
  const status = useState<MarketplaceOnboardingStatus | null>(
    'interlaken-essen-onboarding-status',
    () => null
  )

  const setStatus = (nextStatus: MarketplaceOnboardingStatus) => {
    status.value = nextStatus
  }

  const clearStatus = () => {
    status.value = null
  }

  const refresh = async () => {
    const user = currentUser.value
    if (!user) {
      clearStatus()
      return null
    }

    const token = await user.getIdToken()
    const response = await $fetch<MarketplaceAccountResponse>(
      '/api/marketplace/account',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    setStatus(response.membership.onboarding_status)
    return response.membership.onboarding_status
  }

  return {
    status,
    setStatus,
    clearStatus,
    refresh,
  }
}
