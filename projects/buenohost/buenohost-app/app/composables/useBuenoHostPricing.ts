import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/composables/fireux/pricing/usePricing'

const buenoHostPricingProfile = {
  appName: 'BuenoHost',
  contactEmail: 'fire@fireux.app',
  consoleName: 'Host Console',
  free: [
    'Use one Property workspace',
    'Publish one guest stay guide',
    'Create a guest URL and QR code',
    'Manage the guide from the Host Console',
  ],
  pro: [
    'Manage multiple properties and rooms',
    'Publish property and room guides',
    'Manage reservations and the stay calendar',
    'Give the hosting team Console access',
  ],
} as const satisfies PricingProfile

export function useBuenoHostPricing() {
  return usePricing(buenoHostPricingProfile)
}
