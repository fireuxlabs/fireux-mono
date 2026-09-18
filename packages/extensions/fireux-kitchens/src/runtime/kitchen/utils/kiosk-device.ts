import type { KitchenService } from '../models/service.model'
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
  kitchen_service_id: '',
  menu_id: '',
  label: '',
  status: 'active',
  session_hash: '',
  expires_at: null,
  created: null,
  updated: null,
} as const satisfies KitchenKioskDeviceRecord

/** Configuration eligibility, not an assertion that serving hours are open now. */
export function kitchenServiceSupportsKiosk(
  service: KitchenService | undefined,
  menuId?: string
) {
  return Boolean(
    service?.enabled &&
      service.hours?.timezone &&
      service.hours.windows.length &&
      (!menuId || service.menu_ids.includes(menuId)) &&
      service.interactions.some(
        (interaction) =>
          (interaction.type === 'eat_in' || interaction.type === 'takeaway') &&
          interaction.enabled &&
          !interaction.availability?.paused
      )
  )
}
