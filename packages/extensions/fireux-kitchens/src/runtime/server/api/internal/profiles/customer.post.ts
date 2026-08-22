// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Customer provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import { createCustomerProfileSeed } from '../../../../user/utils/customer.ts'

export default createProfileProvisionHandler({
  kind: 'customer',
  label: 'Customer',
  profile: {
    seed: createCustomerProfileSeed,
  },
})
