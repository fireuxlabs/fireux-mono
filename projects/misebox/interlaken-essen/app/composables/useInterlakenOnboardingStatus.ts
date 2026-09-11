import type {
  MarketplaceAccountResponse,
  MarketplaceOnboardingStatus,
} from '@/content/marketplace-profile'
import { useState } from '#imports'
import { computed, watch } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
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

  const read = useLiveAsyncData<MarketplaceAccountResponse | null>(
    computed(() => `market-account:${currentUser.value?.uid || ''}`),
    async (liveFetch) => {
      const user = currentUser.value
      if (!user) return null
      return liveFetch<MarketplaceAccountResponse>('/api/marketplace/account', {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      })
    },
    { server: false }
  )
  watch(read.data, (value) => {
    status.value = value?.membership.onboarding_status || null
  })
  const refresh = async () => {
    await read.refresh()
    return status.value
  }

  return {
    status,
    setStatus,
    clearStatus,
    refresh,
  }
}
