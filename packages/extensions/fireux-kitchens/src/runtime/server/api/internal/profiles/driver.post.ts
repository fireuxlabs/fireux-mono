// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Driver provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import {
  AppDriverStorage,
  createAppDriverProfileSeed,
  createDriverProfileSeed,
  DriverStorage,
} from '../../../../models/driver.model.ts'

export default createProfileProvisionHandler({
  id: 'driver',
  label: 'Driver',
  root: {
    collection: DriverStorage.rootCollection,
    seed: createDriverProfileSeed,
  },
  app: {
    collection: AppDriverStorage.collection,
    seed: createAppDriverProfileSeed,
  },
})
