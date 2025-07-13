// ~/types/profile-config.ts

/**
 * Configuration for profile display sections
 */
export interface ProfileSection {
  /** Section key/identifier */
  key: string
  /** Display title for the section */
  title: string
  /** Section renderer type */
  type: string
  /** Specific field to use (if different from key) */
  field?: string
  /** Additional configuration for the section */
  config?: Record<string, any>
  /** Fields to include in this section */
  fields?: string[]
}

/**
 * Configuration for profile display components
 * Handles different profile types with their specific properties
 */
export interface ProfileDisplayConfig {
  /** Function to get display name from profile data */
  getDisplayName: (data: any) => string
  /** Function to get subtitle from profile data */
  getSubtitle?: (data: any) => string | undefined
  /** Function to get avatar URL from profile data */
  getAvatar: (data: any) => string | undefined
  /** Loading icon for this profile type */
  loadingIcon?: string
  /** Loading text for this profile type */
  loadingText?: string
  /** Sections to display in the profile */
  sections: ProfileSection[]
}

/**
 * Configuration for profile edit components
 */
export interface ProfileEditConfig {
  /** Profile type name */
  profileType: string
  /** Edit sections configuration */
  sections: ProfileEditSection[]
  /** Fields that require special handling */
  specialFields?: Record<string, any>
}

/**
 * Configuration for profile edit sections
 */
export interface ProfileEditSection {
  /** Section key/identifier */
  key: string
  /** Display title for the section */
  title: string
  /** Section description */
  description?: string
  /** Fields in this section */
  fields: ProfileField[]
}

/**
 * Configuration for individual profile fields
 */
export interface ProfileField {
  /** Field key */
  key: string
  /** Field label */
  label: string
  /** Field type */
  type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'array' | 'file'
  /** Whether field is required */
  required?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Field validation rules */
  validation?: Record<string, any>
  /** Additional field configuration */
  config?: Record<string, any>
}

/**
 * Configuration for profile card components
 */
export interface ProfileCardConfig {
  /** Function to get display name */
  getDisplayName: (data: any) => string
  /** Function to get avatar URL */
  getAvatar: (data: any) => string | undefined
  /** Function to get subtitle */
  getSubtitle?: (data: any) => string | undefined
  /** Fields to show in card */
  cardFields: ProfileCardField[]
}

/**
 * Configuration for profile card fields
 */
export interface ProfileCardField {
  /** Field key */
  key: string
  /** Display label */
  label: string
  /** Field type for rendering */
  type: 'text' | 'badge' | 'contact' | 'stats'
  /** Icon to show with field */
  icon?: string
}
