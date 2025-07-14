import type { ProfileConfig } from '../../../../fireux-core/src/runtime/models/profiles/profile.model'

/**
 * Professional Profile Configuration
 * 
 * Defines the configuration for professional profile operations including
 * collection name, type, and scoping for the useProfile composable.
 */
export const professionalConfig: ProfileConfig = {
  collectionName: 'professionals',
  profileType: 'Professional',
  appScoped: false, // Professionals are global across all apps
}
