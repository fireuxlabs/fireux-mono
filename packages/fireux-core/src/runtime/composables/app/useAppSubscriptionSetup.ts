// ~/composables/app/useAppSubscriptionSetup.ts

/**
 * Subscription setup for new apps
 * Automatically creates Pro and Enterprise subscription products with Stripe integration
 *
 * NOTE: Temporarily disabled due to import issues - will fix after profile work
 */
export function useAppSubscriptionSetup() {
  /**
   * Creates both Pro and Enterprise subscription products for a new app
   * @param appId The app identifier
   * @param appName The app name
   */
  async function createAppSubscriptionProducts(
    appId: string,
    appName: string
  ): Promise<void> {
    console.log(
      `🚀 [createAppSubscriptionProducts] Setting up subscriptions for ${appName} - DISABLED`
    )
    // Temporarily disabled to focus on profile system
    return Promise.resolve()
  }

  /**
   * Check if subscription products already exist for the app
   * @param appId The app identifier
   */
  async function subscriptionProductsExist(appId: string): Promise<boolean> {
    console.log(
      `🔍 [subscriptionProductsExist] Checking for ${appId} - DISABLED`
    )
    // Temporarily disabled to focus on profile system
    return Promise.resolve(false)
  }

  return {
    createAppSubscriptionProducts,
    subscriptionProductsExist,
  }
}
