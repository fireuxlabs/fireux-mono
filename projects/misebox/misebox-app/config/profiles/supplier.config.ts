import type { ProfileConfig } from '../../../../../packages/fireux-core/src/runtime/models/profiles/profile.model'

/**
 * Supplier Profile Configuration
 * 
 * Defines the configuration for supplier profile operations including
 * collection name, type, and scoping for the useProfile composable.
 */
export const supplierConfig: ProfileConfig = {
  collectionName: 'suppliers',
  profileType: 'Supplier',
  appScoped: true, // Suppliers are specific to misebox
}
