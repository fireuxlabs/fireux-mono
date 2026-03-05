import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime ops status used by Granite client watchlists.
 */
export type ClientStatus = 'active' | 'ending' | 'arrears' | 'prospect'

/**
 * Business entity shape.
 * Granite clients are usually organizations (fund, company, family office, public body),
 * while people should live under `contacts`.
 */
export type ClientEntityKind = 'organization' | 'individual'

export type ClientEntityType =
  | 'company'
  | 'conglomerate'
  | 'family_office'
  | 'fund'
  | 'non_profit'
  | 'public_body'
  | 'trust'
  | 'partnership'
  | 'individual'
  | 'other'

export type ClientRelationshipStatus = 'active' | 'prospect' | 'paused' | 'inactive'
export type ClientRiskLevel = 'low' | 'medium' | 'high'

export type ClientContactRole =
  | 'portfolio_manager'
  | 'asset_manager'
  | 'finance'
  | 'legal'
  | 'operations'
  | 'other'

export interface ClientContact {
  id: string
  display_name: string
  job_title?: string
  role: ClientContactRole
  email: string
  phone: string
  is_primary: boolean
  notes: string
}

export interface Client {
  // Canon IDs
  id: string
  portfolio_id: string
  portfolio_ids?: string[]
  property_id: string
  property_ids?: string[]
  property_label: string
  unit_id: string
  unit_ids?: string[]
  lease_id: string
  lease_end_date: string

  // Entity identity
  display_name: string
  legal_name?: string
  trading_name?: string
  entity_kind?: ClientEntityKind
  entity_type?: ClientEntityType
  parent_client_id?: string
  ultimate_parent_name?: string
  registration_number?: string
  tax_id?: string
  jurisdiction?: string

  // Runtime ops fields
  status: ClientStatus
  relationship_status?: ClientRelationshipStatus
  relationship_since?: string
  risk_level?: ClientRiskLevel
  risk_notes?: string
  monthly_rent: number
  currency: string

  // Presentation + communication
  avatar_url: string
  logo_url?: string
  email: string
  phone: string
  website_url?: string

  // Relationship layer
  contacts?: ClientContact[]
  account_owner_user_id?: string
  notes: string
  tags?: string[]

  // Optional stamps when persisted to Firestore.
  created?: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
    app_id?: FireuxStamped['created']['app_id']
  }
  updated?: {
    at: FirebaseTimestamp
    by?: FireuxStamped['updated']['by']
  }
}
