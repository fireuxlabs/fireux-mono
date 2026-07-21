// Concurrent edit — 2026-07-20 22:59 CEST — Both-Entity Authority — Property: keep independent identity, private support, and explicit publication.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify Property root identity and access-only App support.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: name Property access support directly.
// Concurrent edit — 2026-07-21 16:39 CEST — Misebox dev stability pass: make server-reachable workspace runtime value imports explicit.
import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type {
  FireuxAppAccessRecord,
  FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import {
  FireuxAppAccessRecordModel,
  FireuxAppScope,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown>
    ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

/**
 * Family: Property
 * Storage: canonical root property plus an app-scoped support record
 * Owner app scope: Property console / product shell
 * Scope: BuenoHost-style property information records
 *
 * Decision note:
 * - Root means canonical identity, not automatically public-readable.
 * - BuenoHost can use Property without Portfolio.
 * - Property owns its optional Portfolio relationship through `portfolio_id`.
 * - Access belongs only to AppProperty.
 * - Guest-manual secrets use a separate private support record so access-list
 *   reads never download operational credentials.
 */
export const PropertyStorage = {
  shape: 'root-and-app-support',
  root: 'properties/{propertyId}',
  appSupport: 'apps/{appId}/properties/{propertyId}',
  rootCollection: 'properties',
  appSupportCollection: 'properties',
  idParam: 'propertyId',
} as const

export const PropertyEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Property',
  family: ['property', 'console-entity'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'access-record',
  publicRead: 'projection',
  status: 'confirmed',
  console: true,
  root: PropertyStorage.root,
  appSupportPath: PropertyStorage.appSupport,
})

export const AppPropertyStorage = {
  shape: 'scoped',
  path: PropertyStorage.appSupport,
  collection: PropertyStorage.appSupportCollection,
  parent: 'app',
  idParam: PropertyStorage.idParam,
} as const

export const PropertyManualStorage = {
  shape: 'scoped-support',
  path: 'apps/{appId}/properties/{propertyId}/private/manual',
  collection: 'private',
  documentId: 'manual',
  parent: 'app-property',
  propertyIdParam: PropertyStorage.idParam,
} as const

export const PropertyIdentityModel = {
  name: '' as string,
  image_url: '' as string,
  property_type: 'residential' as 'residential' | 'commercial' | 'mixed',
  unit_count: 0 as number,
  estimated_value: 0 as number,
  estimated_value_currency: '' as string,
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

export type PropertyPublicationState = 'draft' | 'published' | 'retired'

export const PropertyModel = {
  id: '' as string,
  slug: '' as string,
  portfolio_id: '' as string,
  place_id: '' as string,
  ...FireuxAppScope,
  identity: PropertyIdentityModel,
  status: 'active' as 'active' | 'inactive',
  publication_state: 'draft' as PropertyPublicationState,
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

export type PropertyIdentity = WidenLiteral<typeof PropertyIdentityModel>

export type PropertyManual = WidenLiteral<typeof PropertyManualModel>

export type PropertyManualRecord = PropertyManual & FireuxStamped

export type Property = WidenLiteral<typeof PropertyModel>

export const AppPropertyModel = {
  ...FireuxAppAccessRecordModel,
} as const

export type AppProperty = FireuxAppAccessRecord

export type PropertyCreateInput = {
  id?: string
  slug?: string
  portfolio_id?: string
  place_id: string
  identity: PropertyIdentity
  status?: Property['status']
}

export type PropertyUpdateInput = Partial<
  Pick<Property, 'slug' | 'portfolio_id' | 'place_id' | 'identity' | 'status'>
>

export type AppPropertyCreateInput = Pick<
  AppProperty,
  'operator_ids' | 'team_ids' | 'join_requests'
>
