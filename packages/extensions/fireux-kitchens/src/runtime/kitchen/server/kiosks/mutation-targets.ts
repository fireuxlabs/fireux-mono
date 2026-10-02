import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { KitchenKioskDeviceStorage } from '../../utils/kiosk-device.ts'

export const serverKitchenKiosksTarget = (kitchenId: string) => {
  const kitchen = assertFirestoreMutationSegment(kitchenId, 'kitchenId')
  return defineFirestoreMutationTarget({
    key: 'kitchens.kiosks',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${kitchen}/${KitchenKioskDeviceStorage.collection}`,
  })
}
