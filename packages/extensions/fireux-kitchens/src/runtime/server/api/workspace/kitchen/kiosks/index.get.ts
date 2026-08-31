import { defineEventHandler, getQuery } from 'h3'
import { readKitchenKioskDevices } from '../../../../../kitchen/server/operations/kiosks/devices.ts'

export default defineEventHandler((event) =>
  readKitchenKioskDevices(event, {
    kitchenId: String(getQuery(event).kitchen_id || ''),
  })
)
