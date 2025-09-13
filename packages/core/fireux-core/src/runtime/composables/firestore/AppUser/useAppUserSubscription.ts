export function useAppUserSubscription() {
  // Subscription moved out of AppUser; keep a no-op API surface for back-compat
  const falsey = () => false
  const noop = () => false
  const unknown = () => undefined
  const free = () => 'free'
  const gray = () => 'gray'

  return {
    // Subscription status (deprecated)
    isFreeUser: true,
    isProUser: false,
    isEnterpriseUser: false,
    isTrialing: false,
    isExpired: false,

    // Plan information (deprecated)
    whichPlan: free(),
    planDisplayName: 'Free',
    planBadgeColor: gray(),
    subscriptionStatus: 'inactive',
    subscriptionEndsAt: unknown(),
    stripeCustomerId: unknown(),

    // Methods (deprecated)
    canAccessFeature: noop,
    hasActiveSubscription: falsey,
  }
}
