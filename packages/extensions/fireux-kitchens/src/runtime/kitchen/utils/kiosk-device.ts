import type { KitchenKioskDeviceRecord } from '../models/kiosk-device.model'

export type { KitchenKioskDeviceRecord } from '../models/kiosk-device.model'

/**
 * Kitchen-owned trusted device authorization.
 *
 * Raw session tokens never belong in Firestore. The server stores only the
 * digest and projects safe operator summaries through the Workspace API.
 */
export const KitchenKioskDeviceStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/kiosks/{kioskId}',
  collection: 'kiosks',
  parent: 'kitchen',
  idParam: 'kioskId',
} as const

export const KitchenKioskDeviceDefaults = {
  app_id: '',
  kitchen_id: '',
  kitchen_slug: '',
  menu_id: '',
  label: '',
  status: 'active',
  session_hash: '',
  expires_at: null,
  created: null,
  updated: null,
} as const satisfies KitchenKioskDeviceRecord
