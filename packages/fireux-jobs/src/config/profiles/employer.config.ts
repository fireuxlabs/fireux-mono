import type { ProfileConfig } from '../../../../fireux-core/src/runtime/models/profiles/profile.model'

/**
 * Employer Profile Configuration
 * 
 * Defines the configuration for employer profile operations including
 * collection name, type, and scoping for the useProfile composable.
 */
export const employerConfig: ProfileConfig = {
  collectionName: 'employers',
  profileType: 'Employer',
  appScoped: false, // Employers are global across all apps
}
