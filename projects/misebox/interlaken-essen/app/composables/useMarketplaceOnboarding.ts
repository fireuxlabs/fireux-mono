import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { useInterlakenOnboardingStatus } from '@/composables/useInterlakenOnboardingStatus'
import { computed, onMounted, onUnmounted, ref, watch } from '#imports'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserUpdate } from 'fireux-core/runtime/user/composables/firestore/mutations/useUserUpdate'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import {
  INTERLAKEN_LOCALITIES,
  OTHER_LOCALITY_ID,
  type InterlakenLocalityId,
  type MarketplaceOnboardingInput,
} from '../content/marketplace-profile'

export function useMarketplaceOnboarding() {
  const { copy } = useInterlakenCopy()
  const { authState, currentUser: authUser } = useAuth()
  const {
    status: refreshedOnboardingStatus,
    setStatus: setOnboardingStatus,
    clearStatus: clearOnboardingStatus,
    refresh: refreshOnboardingStatus,
  } = useInterlakenOnboardingStatus()
  const user = useUser()
  const {
    appUser,
    appPending,
    appOutcome,
    avatarSrc,
  } = user
  const { app: appUpdates } = useUserUpdate(
    user,
    'useMarketplaceOnboarding'
  )
  const { membership } = appUpdates
  const { getProxiedAvatarUrl } = useAvatarProxy()

  const localityId = ref<InterlakenLocalityId | ''>('')
  const localityLabel = ref('')
  const postalCode = ref('')
  const offersEnabled = ref(false)
  const publicName = ref('')
  const introduction = ref('')
  const loading = ref<'' | 'saving' | 'skipped'>('')
  const errorKey = ref<
    | 'onboarding_error_auth'
    | 'onboarding_error_save_retry'
    | 'onboarding_error_save'
    | null
  >(null)
  const dismissed = ref(false)
  const completed = ref(false)
  const readyToCheck = ref(false)
  let readinessTimer: number | undefined
  let completionTimer: number | undefined

  onMounted(() => {
    readinessTimer = window.setTimeout(() => {
      readyToCheck.value = true
    }, 600)
  })

  onUnmounted(() => {
    if (readinessTimer) window.clearTimeout(readinessTimer)
    if (completionTimer) window.clearTimeout(completionTimer)
  })

  const isPendingOnboarding = computed(() => {
    if (authState.value !== 'AUTHENTICATED') return false
    if (!readyToCheck.value) return false
    if (refreshedOnboardingStatus.value) {
      return refreshedOnboardingStatus.value === 'pending'
    }
    if (appPending.value) return false

    // Onboarding is a positive stored state, not a fallback for an unresolved or
    // failed membership read. Unknown outcomes must never trap returning users.
    return (
      appOutcome.value === 'ready' &&
      appUser.value?.onboarding_status === 'pending'
    )
  })

  const open = computed(() => !dismissed.value && isPendingOnboarding.value)

  watch(
    [authState, () => authUser.value?.uid],
    ([state, uid]: [
      'AUTHENTICATED' | 'NOT_AUTHENTICATED',
      string | null | undefined,
    ]) => {
      if (state !== 'AUTHENTICATED' || !uid) {
        clearOnboardingStatus()
        return
      }
      void refreshOnboardingStatus().catch(() => undefined)
    },
    { immediate: true }
  )

  const authDisplayName = computed(() =>
    String(authUser.value?.displayName || '').trim()
  )
  const authInitials = computed(() => {
    const parts = authDisplayName.value.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'U'
  })
  const authAvatarSrc = computed(() => {
    const authSource =
      typeof authUser.value?.photoURL === 'string'
        ? authUser.value.photoURL.trim()
        : ''
    return getProxiedAvatarUrl(avatarSrc.value || authSource || undefined)
  })

  const formIsValid = computed(() => {
    if (!localityId.value) return false
    if (
      localityId.value === OTHER_LOCALITY_ID &&
      (localityLabel.value.trim().length < 2 ||
        !/^\d{4}$/.test(postalCode.value.trim()))
    ) {
      return false
    }
    if (!offersEnabled.value) return true
    return (
      publicName.value.trim().length >= 2 &&
      introduction.value.trim().length >= 10
    )
  })

  watch(offersEnabled, (enabled: boolean) => {
    if (enabled && !publicName.value.trim()) {
      publicName.value = authDisplayName.value
    }
  })

  async function completeOnboarding() {
    if (loading.value || !formIsValid.value) return
    const user = authUser.value
    if (!user) {
      errorKey.value = 'onboarding_error_auth'
      return
    }

    errorKey.value = null
    loading.value = 'saving'

    const body: MarketplaceOnboardingInput = {
      locality_id: localityId.value as InterlakenLocalityId,
      offers_enabled: offersEnabled.value,
      ...(localityId.value === OTHER_LOCALITY_ID
        ? {
            locality_label: localityLabel.value.trim(),
            postal_code: postalCode.value.trim(),
          }
        : {}),
      ...(offersEnabled.value
        ? {
            public_name: publicName.value.trim(),
            introduction: introduction.value.trim(),
          }
        : {}),
    }

    try {
      const token = await user.getIdToken()
      await $fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      setOnboardingStatus('completed')
      completed.value = true
      completionTimer = window.setTimeout(() => {
        dismissed.value = true
      }, 1600)
    } catch {
      errorKey.value = 'onboarding_error_save_retry'
    } finally {
      loading.value = ''
    }
  }

  async function skipOnboarding() {
    if (loading.value) return

    errorKey.value = null
    loading.value = 'skipped'

    try {
      await membership.setOnboardingStatus('skipped')
      setOnboardingStatus('skipped')
      dismissed.value = true
    } catch {
      errorKey.value = 'onboarding_error_save'
    } finally {
      loading.value = ''
    }
  }

  return {
    INTERLAKEN_LOCALITIES,
    OTHER_LOCALITY_ID,
    authAvatarSrc,
    authDisplayName,
    authInitials,
    completeOnboarding,
    completed,
    copy,
    errorKey,
    formIsValid,
    introduction,
    loading,
    localityId,
    localityLabel,
    offersEnabled,
    open,
    postalCode,
    publicName,
    skipOnboarding,
  }
}
