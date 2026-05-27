import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: scoped operational record
 * Owner app scope: Portfolio
 * Scope: portfolio client and relationship state
 *
 * Decision note:
 * - Client is currently treated as a portfolio-owned operational entity, not a global root record.
 * - If a cross-portfolio client canon appears later, update the models README first, then this file.
 */
export const ClientStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/portfolios/{portfolioId}/clients/{clientId}',
  collection: 'clients',
  parent: 'portfolio',
  idParam: 'clientId',
} as const

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

export const ClientModel = {
  // Canon IDs
  id: '' as string,
  portfolio_id: '' as string,
  portfolio_ids: [] as string[],
  property_id: '' as string,
  property_ids: [] as string[],
  property_label: '' as string,
  unit_id: '' as string,
  unit_ids: [] as string[],
  lease_id: '' as string,
  lease_end_date: '' as string,

  // Entity identity
  display_name: '' as string,
  legal_name: '' as string,
  trading_name: '' as string,
  entity_kind: 'organization' as ClientEntityKind,
  entity_type: 'company' as ClientEntityType,
  parent_client_id: '' as string,
  ultimate_parent_name: '' as string,
  registration_number: '' as string,
  tax_id: '' as string,
  jurisdiction: '' as string,

  // Runtime ops fields
  status: 'active' as ClientStatus,
  relationship_status: 'active' as ClientRelationshipStatus,
  relationship_since: '' as string,
  risk_level: 'low' as ClientRiskLevel,
  risk_notes: '' as string,
  monthly_rent: 0 as number,
  currency: '' as string,

  // Presentation + communication
  avatar_url: '' as string,
  logo_url: '' as string,
  email: '' as string,
  phone: '' as string,
  website_url: '' as string,

  // Relationship layer
  contacts: [] as ClientContact[],
  account_owner_user_id: '' as string,
  notes: '' as string,
  tags: [] as string[],

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Client = {
  [K in keyof typeof ClientModel]: (typeof ClientModel)[K]
}

export type ClientCreateInput = Omit<Client, 'id' | 'created' | 'updated'>
export type ClientUpdateInput = Partial<Omit<Client, 'id' | 'created' | 'updated'>>
