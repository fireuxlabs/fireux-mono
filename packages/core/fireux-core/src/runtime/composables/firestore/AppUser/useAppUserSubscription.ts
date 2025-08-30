import { computed } from 'vue'
import type { Ref } from 'vue'
import type { AppUser } from '../../../models/core/appUser.model'

export function useAppUserSubscription(
  appUser: Ref<AppUser | null | undefined>
) {
  // Subscription status checks
  const isFreeUser = computed(
    () =>
      !appUser.value?.subscription ||
      appUser.value?.subscription?.plan === 'free' ||
      appUser.value?.subscription?.status !== 'active'
  )

  const isProUser = computed(
    () =>
      appUser.value?.subscription?.plan === 'pro' &&
      appUser.value?.subscription?.status === 'active'
  )

  const isEnterpriseUser = computed(
    () =>
      appUser.value?.subscription?.plan === 'enterprise' &&
      appUser.value?.subscription?.status === 'active'
  )

  const isTrialing = computed(
    () =>
      appUser.value?.subscription?.status === 'inactive' &&
      appUser.value?.subscription?.plan !== 'free'
  )

  const isExpired = computed(
    () =>
      appUser.value?.subscription?.status === 'past_due' ||
      appUser.value?.subscription?.status === 'cancelled'
  )

  // Plan information
  const whichPlan = computed(() => {
    if (!appUser.value?.subscription) return 'free'
    if (appUser.value.subscription.status !== 'active') return 'free'
    return appUser.value.subscription.plan
  })

  const planDisplayName = computed(() => {
    switch (whichPlan.value) {
      case 'enterprise':
        return 'Enterprise'
      case 'pro':
        return 'Pro'
      default:
        return 'Free'
    }
  })

  const planBadgeColor = computed(() => {
    switch (whichPlan.value) {
      case 'enterprise':
        return 'purple'
      case 'pro':
        return 'gold'
      default:
        return 'gray'
    }
  })

  // Subscription details
  const subscriptionStatus = computed(
    () => appUser.value?.subscription?.status || 'inactive'
  )

  const subscriptionEndsAt = computed(
    () => appUser.value?.subscription?.ends_at
  )

  const stripeCustomerId = computed(
    () => appUser.value?.subscription?.stripe_customer_id
  )

  // Feature access helpers
  function canAccessFeature(feature: string): boolean {
    // Define feature access rules
    const featureAccess = {
      advanced_analytics: ['pro', 'enterprise'],
      unlimited_storage: ['enterprise'],
      priority_support: ['pro', 'enterprise'],
      api_access: ['enterprise'],
      custom_branding: ['enterprise'],
    }

    const allowedPlans = featureAccess[feature as keyof typeof featureAccess]
    if (!allowedPlans) return true // Feature available to all if not defined

    return whichPlan.value ? allowedPlans.includes(whichPlan.value) : false
  }

  function hasActiveSubscription(): boolean {
    return isProUser.value || isEnterpriseUser.value
  }

  return {
    // Subscription status
    isFreeUser,
    isProUser,
    isEnterpriseUser,
    isTrialing,
    isExpired,

    // Plan information
    whichPlan,
    planDisplayName,
    planBadgeColor,
    subscriptionStatus,
    subscriptionEndsAt,
    stripeCustomerId,

    // Methods
    canAccessFeature,
    hasActiveSubscription,
  }
}
