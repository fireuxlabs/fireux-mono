import { defineEventHandler, readBody } from 'h3'
import { activateKitchenKioskDevice } from '../../../../../kitchen/server/kiosks/devices.ts'

type ActivateKitchenKioskBody = {
  kitchen_id?: string
  kitchen_offering_id?: string
  menu_id?: string
  label?: string
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as ActivateKitchenKioskBody | null
  return activateKitchenKioskDevice(event, {
    kitchenId: String(body?.kitchen_id || ''),
    kitchenOfferingId: String(body?.kitchen_offering_id || ''),
    menuId: String(body?.menu_id || ''),
    label: String(body?.label || ''),
  })
})
