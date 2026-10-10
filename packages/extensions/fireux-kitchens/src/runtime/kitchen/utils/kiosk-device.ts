import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import type { KitchenOffering } from '../models/offering.model'
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
  kitchen_offering_id: '',
  menu_id: '',
  label: '',
  status: 'active',
  session_hash: '',
  expires_at: null,
  created: null,
  updated: null,
} as const satisfies KitchenKioskDeviceRecord

/** Configuration eligibility, not an assertion that serving hours are open now. */
export function kitchenOfferingSupportsKiosk(
  service: KitchenOffering | undefined,
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

/** Accept only the activation that was requested before opening its local route. */
export function readKitchenKioskActivationPath(
  response: unknown,
  expected: { menuId: string; kitchenOfferingId: string; livePath: string }
): string {
  const result = response as { ok?: unknown; device?: unknown } | null
  const device = result?.device as Record<string, unknown> | null | undefined
  if (
    result?.ok !== true ||
    !device ||
    Array.isArray(device) ||
    typeof device.id !== 'string' ||
    !isFirestoreDocumentId(device.id) ||
    device.id.trim() !== device.id ||
    device.menuId !== expected.menuId ||
    device.kitchenOfferingId !== expected.kitchenOfferingId ||
    device.current !== true ||
    device.status !== 'active' ||
    !expected.livePath ||
    !expected.livePath.startsWith('/kitchens/') ||
    device.livePath !== expected.livePath
  )
    throw new Error(
      'Kiosk activation did not match the requested Menu and Offering.'
    )
  return expected.livePath
}
