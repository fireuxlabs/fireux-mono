import type { ProfileConfig } from '../../../../../packages/fireux-core/src/runtime/models/profiles/profile.model'

/**
 * Chef Profile Configuration
 *
 * Defines the configuration for chef profile operations including
 * collection name, type, and scoping for the useProfile composable.
 */
export const chefConfig: ProfileConfig = {
  collectionName: 'chefs',
  profileType: 'Chef',
}
