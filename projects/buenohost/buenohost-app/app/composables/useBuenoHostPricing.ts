import {
  usePricing,
  type PricingProfile,
} from 'fireux-core/runtime/app/composables/pricing/usePricing'

const buenoHostPricingProfile = {
  appName: 'BuenoHost',
  contactEmail: 'fire@fireux.app',
  workspaceName: 'Host Workspace',
  entityName: 'Property',
  entityPluralName: 'Properties',
  free: [
    'Use one Property workspace',
    'Publish one guest stay guide',
    'Create a guest URL and QR code',
    'Manage the guide from the Host Workspace',
  ],
  professional: [
    'Manage multiple properties and rooms',
    'Publish property and room guides',
    'Manage reservations and the stay calendar',
    'Give the hosting team Workspace access',
  ],
} as const satisfies PricingProfile

export function useBuenoHostPricing() {
  return usePricing(buenoHostPricingProfile)
}
