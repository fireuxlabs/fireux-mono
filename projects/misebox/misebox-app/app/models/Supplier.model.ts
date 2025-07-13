import type { BaseProfile } from '../../../../../packages/fireux-core/src/runtime/models/baseProfile.model'

export interface Supplier extends BaseProfile {
  // NOTE: uid, id, created_at, updated_at inherited from BaseProfile

  // Business Identity
  avatar?: string // Business avatar/logo (separate from AppUser avatar)
  business_name: string // Official business name
  business_type?: string // "restaurant", "catering", "food_truck", "grocery", "distributor"
  display_name?: string // Public display name (may differ from business_name)
  bio_short?: string // Short business description
  bio_long?: string // Detailed business description

  // Contact Information
  contact_person?: string // Primary contact person name
  phone?: string
  email?: string
  website_url?: string

  // Business Location and Service Areas
  business_address?: {
    street_address: string
    city: string
    state: string
    zip_code: string
    country: string
    place_id?: string // Google Places ID
    formatted_address?: string
    latitude?: number
    longitude?: number
  }

  service_areas?: Array<{
    city: string
    state: string
    zip_codes?: string[]
    delivery_radius_km?: number
    place_id?: string
  }>

  // Product Categories and Specialties
  product_categories?: string[] // "produce", "meat", "dairy", "seafood", "dry_goods", "beverages"
  specialties?: string[] // "organic", "local", "imported", "specialty_items"
  dietary_categories?: string[] // "vegan", "gluten_free", "halal", "kosher"

  // Business Credentials and Certifications
  business_license?: {
    license_number: string
    issuing_authority: string
    issue_date: Date | string
    expiry_date: Date | string
    document_url?: string
  }

  certifications?: Array<{
    name: string // e.g., "USDA Organic", "FDA Certified", "SQF Quality"
    year: string
    issuing_organization: string
    image_url?: string
    document_url?: string
    expiry_date?: string
  }>

  insurance?: {
    provider: string
    policy_number: string
    coverage_amount: number
    expiry_date: Date | string
    document_url?: string
  }

  // Supply and Inventory
  typical_products?: Array<{
    category: string
    product_name: string
    description?: string
    unit_types?: string[] // "lb", "kg", "case", "pallet"
    seasonal?: boolean
    availability_months?: string[]
    min_order_quantity?: number
    image_url?: string
  }>

  inventory_management?: {
    real_time_inventory: boolean
    lead_time_days: number
    bulk_order_discounts: boolean
    seasonal_pricing: boolean
  }

  // Delivery and Logistics
  delivery_options?: {
    self_delivery: boolean
    third_party_delivery: boolean
    pickup_available: boolean
    delivery_schedule?: string[]
    minimum_order_value?: number
    delivery_fee?: number
    free_delivery_threshold?: number
  }

  delivery_zones?: Array<{
    zone_name: string
    cities: string[]
    zip_codes?: string[]
    delivery_fee: number
    min_order_value: number
    delivery_days: string[]
  }>

  // Operational Details
  business_hours?: {
    monday?: { open: string; close: string; is_open: boolean }
    tuesday?: { open: string; close: string; is_open: boolean }
    wednesday?: { open: string; close: string; is_open: boolean }
    thursday?: { open: string; close: string; is_open: boolean }
    friday?: { open: string; close: string; is_open: boolean }
    saturday?: { open: string; close: string; is_open: boolean }
    sunday?: { open: string; close: string; is_open: boolean }
  }

  order_processing?: {
    same_day_orders: boolean
    advance_order_required: boolean
    advance_days_required?: number
    rush_orders_available: boolean
    rush_order_fee?: number
  }

  // Payment and Pricing
  payment_methods?: string[] // "cash", "credit_card", "ach", "net_terms"
  payment_terms?: string // "net_30", "net_15", "cash_on_delivery", "prepaid"
  accepts_purchase_orders?: boolean
  credit_application_required?: boolean
  volume_discounts?: boolean

  // Business Relationships
  customer_types?: string[] // "restaurants", "catering", "retail", "wholesale"
  partnership_programs?: string[] // "exclusive_supplier", "preferred_vendor", "seasonal_partner"

  references?: Array<{
    business_name: string
    contact_person: string
    position: string
    phone?: string
    email?: string
    relationship: string // "current_customer", "former_customer", "partner"
    years_relationship: number
  }>

  // Performance and Quality
  quality_standards?: string[] // "HACCP", "SQF", "BRC", "organic_certified"
  sustainability_practices?: string[] // "local_sourcing", "eco_packaging", "carbon_neutral"

  // System and Analytics
  business_status?:
    | 'active'
    | 'seasonal'
    | 'temporarily_closed'
    | 'permanently_closed'
  verification_status?: 'pending' | 'verified' | 'rejected'
  verification_date?: Date | string

  // Timestamps and System Fields
  // created_at and updated_at inherited from BaseProfile
  deleted?: boolean

  // Analytics and Performance
  total_orders?: number
  total_customers?: number
  average_rating?: number
  total_reviews?: number
  on_time_delivery_rate?: number
  customer_retention_rate?: number
}
