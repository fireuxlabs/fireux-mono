import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readKitchenKioskDevices } from '../../../../../kitchen/server/kiosks/devices.ts'

export default defineLiveReadHandler((event) =>
  readKitchenKioskDevices(event, {
    kitchenId: String(getQuery(event).kitchen_id || ''),
  })
)
