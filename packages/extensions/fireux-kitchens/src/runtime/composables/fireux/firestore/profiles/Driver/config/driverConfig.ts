// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: seed required Driver coverage atomically.
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'
import {
  AppDriverModel,
  DriverModel,
} from '../../../../../../models/driver.model'

export const driverConfig: ProfileConfig = {
  id: 'driver',
  collectionName: 'drivers',
  profileType: 'Driver',
  cta: 'Create your Driver profile to accept kitchen delivery work.',
  navLabel: 'Driver',
  navIcon: 'i-lucide-car',
  storage: 'root-and-app',
  rootCreateData: {
    coverage: { ...DriverModel.coverage },
  },
  appCreateData: {
    driver_phone: AppDriverModel.driver_phone,
    accepts_weak_pings: AppDriverModel.accepts_weak_pings,
    accepts_delivery_tenders: AppDriverModel.accepts_delivery_tenders,
    active_kitchen_ids: [...AppDriverModel.active_kitchen_ids],
    kitchen_links: [...AppDriverModel.kitchen_links],
  },
} as const
