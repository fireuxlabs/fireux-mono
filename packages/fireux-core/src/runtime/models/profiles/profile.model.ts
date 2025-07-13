/**
 * Profile Interface
 *
 * All profile types (Professional, Employer, Chef, Supplier) extend this interface
 * to ensure consistent structure and behavior across the FireUX system.
 */

export interface Profile {
  uid: string // Firebase Auth UID - used as Firestore document ID
  created_at: Date | string // Creation timestamp
  updated_at?: Date | string // Last update timestamp
}

/**
 * Profile Configuration for generic operations
 */
export interface ProfileConfig {
  collectionName: string // e.g., 'professionals', 'employers'
  profileType: string // e.g., 'Professional', 'Employer'
  appScoped?: boolean // Whether profile is app-specific or global
  updateComposable?: () => any // Optional profile-specific update composable
}

/**
 * Profile Creation Input - excludes auto-generated fields
 */
export type ProfileInput<T extends Profile> = Omit<
  T,
  'created_at' | 'updated_at'
>

/**
 * Profile Update Input - excludes immutable fields
 */
export type ProfileUpdate<T extends Profile> = Partial<
  Omit<T, 'uid' | 'created_at'>
>
