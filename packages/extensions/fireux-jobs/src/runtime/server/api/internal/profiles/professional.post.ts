// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Professional provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import {
  createProfessionalProfileSeed,
} from '../../../../models/profiles/Professional/Professional.model.ts'

export default createProfileProvisionHandler({
  kind: 'professional',
  label: 'Professional',
  profile: {
    seed: createProfessionalProfileSeed,
  },
})
