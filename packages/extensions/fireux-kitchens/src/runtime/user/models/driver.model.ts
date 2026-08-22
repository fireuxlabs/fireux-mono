import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { ProfileAppStateBase } from 'fireux-core/runtime/models/utils/profile.model'

export type DriverKitchenLink = { app_id: string; kitchen_id: string; kitchen_slug: string; kitchen_name: string; relation: 'exclusive' | 'preferred' | 'available'; active: boolean }
export type DriverCoverage = { radius_m: number }
export type Driver = FireuxStamped & { id: string; kind: 'driver'; title: string; subtitle: string; tagline: string; tags: string[]; coverage: DriverCoverage }
export type DriverAppState = ProfileAppStateBase & { driver_phone: string; accepts_weak_pings: boolean; accepts_delivery_tenders: boolean; active_kitchen_ids: string[]; kitchen_links: DriverKitchenLink[] }
