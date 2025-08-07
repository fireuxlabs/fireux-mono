import type {
  Profile,
  ProfileConfig,
} from 'fireux-core/src/runtime/models/profiles/profile.model'

// Product/Item offered by supplier
export interface SupplierProduct {
  id: string // Product ID
  name: string // Product name
  category: string // Product category
  description: string // Product description
  unit_type: string // Unit of measurement (e.g., "kg", "liter", "piece")
  min_order?: number // Minimum order quantity
  price_per_unit?: number // Price per unit
  currency?: string // Currency code
  seasonal?: boolean // Whether product is seasonal
  organic?: boolean // Whether product is organic
  local?: boolean // Whether product is locally sourced
  image_url?: string // Product image
  availability: 'in-stock' | 'out-of-stock' | 'seasonal' | 'pre-order'
  harvest_season?: string // Harvest/availability season
}

// Supplier Location and Delivery Info
export interface SupplierLocation {
  locations: Array<{
    lat: number // Latitude
    lng: number // Longitude
    formatted_address: string // Full address
  }>
  delivery_radius: string // Delivery radius in km
  pickup_available?: boolean // Whether pickup is available
}

// Business Certifications
export interface BusinessCertification {
  name: string // Certification name
  issuer: string // Issuing organization
  issue_date: string // Date issued
  expiry_date?: string // Expiry date
  certificate_url?: string // Certificate document URL
  verified: boolean // Whether certification is verified
}

// Client/Customer type
export interface SupplierClient {
  name: string // Client name
  type: 'restaurant' | 'hotel' | 'catering' | 'retail' | 'other'
  relationship_start: string // When relationship started
  ongoing: boolean // Whether still active client
}

export interface Supplier extends Profile {
  // Core Identity (required fields)
  id: string // Document ID in Firestore (same as uid for compatibility)
  business_name: string // Official business name (e.g., "MiseboxWheels")

  // Business Contact
  email: string // Business email
  title?: string // Business type or role
  bio_short?: string // Short business description
  bio_long?: string // Detailed business description

  // Business Details
  specialties?: string[] // Product specialties and categories
  business_type:
    | 'farm'
    | 'distributor'
    | 'manufacturer'
    | 'wholesaler'
    | 'producer'
    | 'other'
  products_offered?: SupplierProduct[] // Products and services offered

  // Business Operations
  years_in_business?: number // Years operating
  employee_count?: number // Number of employees
  annual_capacity?: string // Annual production/supply capacity

  // Certifications & Standards
  certifications?: BusinessCertification[] // Business certifications
  quality_standards?: string[] // Quality standards followed
  sustainability_practices?: string[] // Sustainability initiatives

  // Location & Delivery
  locations?: SupplierLocation[] // Business locations and delivery areas
  delivery_methods?: string[] // Available delivery methods
  delivery_schedule?: string // Regular delivery schedule

  // Client & Business Stats
  total_items?: number // Total number of products offered
  total_connections?: number // Number of business connections
  active_clients?: SupplierClient[] // Current clients
  client_types?: string[] // Types of clients served

  // Pricing & Terms
  payment_terms?: string[] // Available payment terms
  bulk_discounts?: boolean // Whether bulk discounts available
  seasonal_pricing?: boolean // Whether prices vary by season

  // Contact & Communication
  contact_person?: string // Primary contact person
  phone?: string // Business phone
  website?: string // Business website

  // Social Proof
  testimonials?: Array<{
    client_name: string
    testimonial: string
    date: string
  }>

  // System Fields
  updated_at?: string | Date // Last update date
  deleted?: boolean // Soft delete flag
  verified?: boolean // Whether supplier is verified
  featured?: boolean // Whether supplier is featured
}

// Supplier validation functions
export function validateSupplierProfile(supplier: Partial<Supplier>): boolean {
  return !!(
    supplier.business_name &&
    supplier.specialties &&
    supplier.specialties.length > 0
  )
}

export function validateSupplierProduct(
  product: Partial<SupplierProduct>
): boolean {
  return !!(product.name && product.category && product.unit_type)
}

// Supplier Profile Configuration with enhanced functionality
export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',

  // Validation function
  validationFn: validateSupplierProfile,

  // Required fields for profile creation
  requiredFields: ['business_name', 'specialties'],

  // Searchable fields for profile discovery
  searchableFields: [
    'business_name',
    'specialties',
    'business_type',
    'location',
  ],

  // Default values for new supplier profiles
  defaultValues: {
    specialties: [],
    certifications: [],
    products_offered: [],
    verified: false,
    featured: false,
    accepts_bulk_orders: false,
    accepts_custom_orders: false,
  },
}

// CTA Configuration for Supplier profiles
export const supplierCtaConfig = {
  title: '🚛 Launch Your Supply Business',
  description:
    'Join Misebox as a Supplier to connect with restaurants, hotels, and food businesses seeking quality ingredients and supplies.',
  benefits: [
    '📦 Showcase your products and services',
    '🤝 Connect with restaurants and food businesses',
    '📊 Manage orders and inventory',
    '🌱 Highlight organic and local offerings',
  ],
  createPath: '/suppliers/create',
  createButtonText: 'Create Supplier Profile',
  welcomeBackText: '🚛 Welcome back, Supplier!',
  quickActions: [
    { text: 'Add Products', path: '/suppliers/products/create' },
    { text: 'View Orders', path: '/suppliers/orders' },
  ],
}

// Export types for easier importing
export type SupplierInput = Omit<Supplier, 'uid' | 'created_at' | 'updated_at'>
export type SupplierUpdate = Partial<SupplierInput>
