/**
 * Profile Interface
 *
 * All profile types (Professional, Employer, Chef, Supplier) extend this interface
 * to ensure consistent structure and behavior across the FireUX system.
 */

// Standardized Image/Media Interface

export interface ProfileImage {
  url: string
  width?: number
  height?: number
  alt?: string
  mimeType?: string
  dominantColor?: string
  blurDataURL?: string
}

export interface Profile {
  uid: string // Firebase Auth UID - used as Firestore document ID
  created_at: Date | string // Creation timestamp
  updated_at?: Date | string // Last update timestamp

  // Standardized Avatar System (required for all profiles)
  avatarUrl: string // Primary avatar/profile image URL (required)
  avatar?: ProfileImage // Enhanced avatar with metadata (optional)
}

/**
 * Profile Configuration for generic operations
 */
export interface ProfileConfig {
  id: string // Lowercase singular identifier: 'chef', 'employer', 'professional', 'supplier'
  collectionName: string // e.g., 'professionals', 'employers'
  profileType: string // e.g., 'Professional', 'Employer'
  color?: string // Domain color: 'orange', 'green', 'blue', 'red'
  updateComposable?: () => any // Optional profile-specific update composable
  createComposable?: () => any // Optional profile-specific create composable
  deleteComposable?: () => any // Optional profile-specific delete composable
  validationFn?: (profile: any) => boolean // Optional validation function
  requiredFields?: string[] // Required fields for profile creation
  searchableFields?: string[] // Fields that can be searched
  defaultValues?: Record<string, any> // Default values for new profiles
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
