import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/src/runtime/models/profiles/profile.model'

export interface Supplier extends Profile {
  // Core Identity - supplier has its own independent ID
  id: string // auto-generated supplier ID (same as uid)
  business_name: string // only required field

  // Claim system - simple boolean
  claimed: boolean // false = unclaimed, true = claimed
  claimed_by?: string // uid of user who claimed it (when claimed)

  // Creation tracking - who created this supplier
  created_by: string // uid of chef who first created it

  // Basic info (optional for quick creation)
  business_type?: string // optional for quick creation
  specialties?: string[] // optional for quick creation

  // Contact (only when claimed)
  email?: string
  phone?: string

  // Simple tracking
  total_ingredients?: number // how many ingredients use this supplier
  verified?: boolean // only claimed suppliers can be verified
}

// Simple validation - just needs a name
export function validateSupplierProfile(supplier: Partial<Supplier>): boolean {
  return !!(supplier.business_name && supplier.business_name.trim().length > 0)
}

// Supplier Profile Configuration
export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  color: 'blue',
  validationFn: validateSupplierProfile,
  requiredFields: ['business_name'],
  searchableFields: ['business_name', 'business_type'],
  defaultValues: {
    claimed: false,
    verified: false,
    total_ingredients: 0,
    specialties: [],
  },
}

// CTA Configuration for Supplier profiles
export const supplierCtaConfig = {
  title: '🚛 Launch Your Supply Business',
  description:
    'Join Misebox as a Supplier to add ingredients and connect with restaurants, hotels, and food businesses.',
  benefits: [
    '📦 Add ingredients you supply to the marketplace',
    '🤝 Connect with chefs and restaurants',
    '📊 Track your ingredient catalog',
    '🌱 Showcase your business specialties',
  ],
  createPath: '/suppliers/create',
  createButtonText: 'Create Supplier Profile',
  welcomeBackText: '🚛 Welcome back, Supplier!',
  quickActions: [
    { text: 'Add Ingredients', path: '/ingredients/create' },
    { text: 'View My Ingredients', path: '/ingredients?supplier=me' },
  ],
}

// Export types for easier importing
export type SupplierInput = Omit<Supplier, 'uid' | 'created_at' | 'updated_at'>
export type SupplierUpdate = Partial<SupplierInput>
