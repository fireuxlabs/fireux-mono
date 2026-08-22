// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Chef provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import { createChefProfileSeed } from '../../../../user/utils/chef.ts'

export default createProfileProvisionHandler({
  kind: 'chef',
  label: 'Chef',
  profile: {
    seed: createChefProfileSeed,
  },
})
