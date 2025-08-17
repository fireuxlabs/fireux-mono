// ~/composables/firestore/CoreUser/useCoreUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import type { CoreUser } from '../../../models/core/coreUser.model'

export function useCoreUserComputed(
  coreUser: Ref<CoreUser | null | undefined>
) {
  // Basic computed properties
  const isCoreUser = computed(() => !!coreUser.value)
  const hasAvatar = computed(() => !!coreUser.value?.avatar)
  const userOfApps = computed(() => coreUser.value?.userOf?.length ?? 0)
  const hasMultipleApps = computed(() => userOfApps.value > 1)

  // Profile system - simplified to string array for global access
  const hasProfile = (profileType: string): boolean => {
    const profiles = coreUser.value?.profiles || []
    return profiles.includes(profileType)
  }

  // For simplified model, all profiles are active by default
  const activeProfiles = computed(() => coreUser.value?.profiles || [])

  const profileCount = computed(() => activeProfiles.value.length)

  // Global subscription - works across all apps in tenant
  const isSubscribed = computed(() => !!coreUser.value?.subscription)
  const isPro = computed(() => coreUser.value?.subscription?.is_pro || false)
  const subscriptionPlan = computed(
    () => coreUser.value?.subscription?.plan || 'free'
  )
  const subscriptionStatus = computed(
    () => coreUser.value?.subscription?.status
  )

  // Global social features
  const followerCount = computed(() => coreUser.value?.followers?.length || 0)
  const followingCount = computed(() => coreUser.value?.following?.length || 0)
  const hasFollowers = computed(() => followerCount.value > 0)
  const hasFollowing = computed(() => followingCount.value > 0)

  // Location and identity
  const hasLocation = computed(() => !!coreUser.value?.location)
  const hasAddress = computed(() => !!coreUser.value?.address)
  const hasPhone = computed(() => !!coreUser.value?.phone)

  const fullName = computed(() => {
    const user = coreUser.value
    if (!user) return ''
    if (user.full_name?.firstName && user.full_name?.lastName) {
      return `${user.full_name.firstName} ${user.full_name.lastName}`
    }
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.first_name || user.last_name || user.email || ''
  })

  return {
    // Basic properties
    isCoreUser,
    hasAvatar,
    userOfApps,
    hasMultipleApps,

    // Profile system
    hasProfile,
    activeProfiles,
    profileCount,

    // Global subscription
    isSubscribed,
    isPro,
    subscriptionPlan,
    subscriptionStatus,

    // Social features
    followerCount,
    followingCount,
    hasFollowers,
    hasFollowing,

    // Identity & location
    hasLocation,
    hasAddress,
    hasPhone,
    fullName,
  }
}
