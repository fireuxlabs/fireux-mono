import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import { computed, ref, watch } from 'vue'
import { useAvatarProxy } from 'fireux-core/runtime/composables/media/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import {
  INTERLAKEN_LOCALITIES,
  OTHER_LOCALITY_ID,
  type InterlakenLocalityId,
  type MarketplaceProfile,
  type MarketplaceProfileInput,
} from '../content/marketplace-profile'

/** An explicit edit draft; live account updates do not overwrite unsaved input. */
export function useMarketplaceProfile(profile: MarketplaceProfile) {
  const { copy } = useInterlakenCopy()
  const { currentUser: authUser } = useAuth()
  const ownerUid = authUser.value?.uid
  const { avatarSrc } = useUserSession()
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const localityId = ref<InterlakenLocalityId | ''>(profile.locality_id)
  const localityLabel = ref(profile.locality_label)
  const postalCode = ref(profile.postal_code)
  const offersEnabled = ref(profile.offers_enabled)
  const publicName = ref(profile.public_name)
  const introduction = ref(profile.introduction)
  const loading = ref(false)
  const errorKey = ref<
    'profile_error_auth' | 'profile_error_save_retry' | null
  >(null)

  const authDisplayName = computed(() =>
    String(authUser.value?.displayName || '').trim()
  )
  const authInitials = computed(() => {
    const parts = authDisplayName.value.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'U'
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || 'U'
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'U'
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

  async function saveProfile() {
    if (loading.value || !formIsValid.value) return false
    const user = authUser.value
    if (!user || user.uid !== ownerUid) {
      errorKey.value = 'profile_error_auth'
      return false
    }
    errorKey.value = null
    loading.value = true
    const body: MarketplaceProfileInput = {
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
      if (authUser.value?.uid !== ownerUid) {
        errorKey.value = 'profile_error_auth'
        return false
      }
      await $fetch('/api/marketplace/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      return true
    } catch {
      errorKey.value = 'profile_error_save_retry'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    INTERLAKEN_LOCALITIES,
    OTHER_LOCALITY_ID,
    authAvatarSrc,
    authDisplayName,
    authInitials,
    saveProfile,
    copy,
    errorKey,
    formIsValid,
    introduction,
    loading,
    localityId,
    localityLabel,
    offersEnabled,
    postalCode,
    publicName,
  }
}
