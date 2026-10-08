import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import { FireuxEntityManagementDefaults } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? WidenLiteral<U>[]
        : T extends Record<string, unknown>
          ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
          : T

/**
 * Family: Property
 * Storage: canonical root Property with root-owned Team, operations, and protected support
 * Scope: BuenoHost-style property information records
 *
 * Decision note:
 * - Root means canonical identity; protected fields remain separate.
 * - BuenoHost can use Property without Portfolio.
 * - Property owns its optional Portfolio relationship through `portfolio_id`.
 * - Workspace access follows the current Property access record and App membership.
 * - Guest-manual secrets use a separate private support record so access-list
 *   reads never download operational credentials.
 */
export const PropertyStorage = {
  shape: 'root',
  root: 'properties/{propertyId}',
  rootCollection: 'properties',
  idParam: 'propertyId',
} as const

export const PropertyEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Property',
  family: ['property', 'workspace-entity'],
  identity: 'root',
  authority: 'domain-database',
  appSupport: 'none',
  workspace: true,
  root: PropertyStorage.root,
})

export const PropertyTeamStorage = {
  shape: 'scoped',
  path: 'properties/{propertyId}/team/{memberId}',
  collection: 'team',
  parent: 'property',
  idParam: 'userId',
} as const

export const PropertyManualStorage = {
  shape: 'scoped-support',
  path: 'properties/{propertyId}/private/manual',
  collection: 'private',
  documentId: 'manual',
  parent: 'property',
  propertyIdParam: PropertyStorage.idParam,
} as const

export type PropertyPublicationState = 'draft' | 'published' | 'retired'
export type PropertyStatus = 'active' | 'inactive'
export type PropertyType = 'residential' | 'commercial' | 'mixed'

export const PropertyIdentityModel = {
  name: '' as string,
  image_url: '' as string,
  property_type: 'residential' as PropertyType,
  unit_count: 0 as number,
  slug: '' as string,
  status: 'active' as PropertyStatus,
  publication_state: 'draft' as PropertyPublicationState,
} as const

export const PropertyManualModel = {
  welcome: {
    welcome_note: '' as string,
    manager: '' as string,
    phone: '' as string,
    email: '' as string,
    address: '' as string,
    wifi_network: '' as string,
    wifi_password: '' as string,
  },
  check_in: {
    check_in_time: '' as string,
    arrival_steps: '' as string,
    key_safe: '' as string,
    key_safe_location: '' as string,
    key_safe_code: '' as string,
    key_safe_warning: '' as string,
  },
  checkout: {
    checkout_time: '' as string,
    dishes: '' as string,
    key_return: '' as string,
    tidy_state: '' as string,
    final_checks: '' as string,
    charges: '' as string,
  },
  emergency: {
    police: '' as string,
    fire: '' as string,
    ambulance: '' as string,
    helicopter_rescue: '' as string,
    hospital: '' as string,
    first_aid: '' as string,
    walk_in_clinic: '' as string,
    hani_emergency: '' as string,
    fire_equipment: '' as string,
  },
  house_rules: {
    quiet_hours: '' as string,
    smoking: '' as string,
    windows_doors: '' as string,
    bathrooms: '' as string,
    beds_sofa: '' as string,
    damage_notes: '' as string,
  },
  apartment_guide: {
    heating: '' as string,
    dishwasher: '' as string,
    chargers: '' as string,
    games_books: '' as string,
    iron_board: '' as string,
    tv: '' as string,
    tap_water: '' as string,
  },
  rubbish_recycling: {
    rubbish_bags: '' as string,
    main_bin: '' as string,
    recycling: '' as string,
    not_allowed: '' as string,
  },
  parking: {
    parking_location: '' as string,
    visitor_parking: '' as string,
    avoid: '' as string,
  },
  local_guide: {
    shops: '' as string,
    post_office: '' as string,
    transport: '' as string,
    taxis: '' as string,
    bike_rentals: '' as string,
    walking_west: '' as string,
    walking_ost: '' as string,
    recommendations: '' as string,
  },
  updates: {
    current_notice: '' as string,
    starts: '' as string,
    expires: '' as string,
  },
} as const

/** Optional financial facts; unknown is never an invented zero or currency. */
export type PropertyValuation = {
  estimated_value: number | null
  currency_code: string
}

export const PropertyModel = {
  id: '' as string,
  portfolio_id: '' as string,
  place_id: '' as string,
  management: FireuxEntityManagementDefaults,
  identity: PropertyIdentityModel,
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

export type PropertyIdentity = Omit<
  WidenLiteral<typeof PropertyIdentityModel>,
  'property_type' | 'status' | 'publication_state'
> & {
  property_type: PropertyType
  status: PropertyStatus
  publication_state: PropertyPublicationState
}

export type PropertyManual = WidenLiteral<typeof PropertyManualModel>

export type PropertyManualRecord = PropertyManual & FireuxStamped

export type Property = Omit<
  WidenLiteral<typeof PropertyModel>,
  'management' | 'identity'
> & {
  management: FireuxEntityManagement
  identity: PropertyIdentity
  valuation?: PropertyValuation
}

export type PropertyCreateInput = {
  id?: string
  portfolio_id?: string
  place_id: string
  identity: Pick<PropertyIdentity, 'name'> &
    Partial<Omit<PropertyIdentity, 'name' | 'publication_state'>>
}

/** Sparse Identity command input; financial estimates are not editable here. */
export type PropertyIdentityUpdateInput = Partial<
  Pick<PropertyIdentity, 'name' | 'image_url' | 'property_type' | 'unit_count'>
>
