// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Driver provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import {
  createDriverAppStateSeed,
  createDriverProfileSeed,
} from '../../../../user/models/driver.model.ts'

export default createProfileProvisionHandler({
  kind: 'driver',
  label: 'Driver',
  profile: {
    seed: createDriverProfileSeed,
  },
  appState: {
    seed: createDriverAppStateSeed,
  },
})
