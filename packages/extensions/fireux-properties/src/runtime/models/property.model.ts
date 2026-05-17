import {
  FireuxConsoleAccessModel,
  type FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Portfolio-scoped
 * Storage: scoped operational record
 * Owner app scope: Portfolio
 * Scope: portfolio-owned property records
 *
 * Decision note:
 * - Property currently belongs to portfolio operations rather than to a shared root canon.
 * - Keep ownership explicit through `portfolio_id` while that rule holds.
 * - If that changes later, update the models README first, then this file.
 */

export const PropertyIdentityModel = {
  name: '' as string,
  address_line: '' as string,
  city: '' as string,
  postcode: '' as string,
  country: '' as string,
  place_id: '' as string,
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

export const PropertyModel = {
  id: '' as string,
  portfolio_id: '' as string,
  ...FireuxConsoleAccessModel,
  identity: PropertyIdentityModel,
  manual: PropertyManualModel,
  status: 'active' as 'active' | 'inactive',
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

export type PropertyIdentity = {
  [K in keyof typeof PropertyIdentityModel]: (typeof PropertyIdentityModel)[K]
}

export type PropertyManual = {
  [K in keyof typeof PropertyManualModel]: (typeof PropertyManualModel)[K]
}

export type Property = {
  [K in keyof typeof PropertyModel]: (typeof PropertyModel)[K]
}

export type PropertyCreateInput = Omit<Property, 'created' | 'updated'>
export type PropertyUpdateInput = Partial<
  Omit<Property, 'id' | 'created' | 'updated' | 'portfolio_id'>
>
