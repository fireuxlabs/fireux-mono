// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Customer provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import {
  createAppCustomerProfileSeed,
  CustomerStorage,
} from '../../../../user/models/customer.model.ts'

export default createProfileProvisionHandler({
  id: 'customer',
  label: 'Customer',
  app: {
    collection: CustomerStorage.collection,
    seed: createAppCustomerProfileSeed,
  },
})
