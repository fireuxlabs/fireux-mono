import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import { revokeKitchenKioskDevice } from '../../../../../kitchen/server/operations/kiosks/devices.ts'

export default defineEventHandler((event) =>
  revokeKitchenKioskDevice(event, {
    kitchenId: String(getQuery(event).kitchen_id || ''),
    kioskId: String(getRouterParam(event, 'kioskId') || ''),
  })
)
