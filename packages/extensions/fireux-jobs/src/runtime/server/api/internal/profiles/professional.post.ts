// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Professional provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision.ts'
import {
  AppProfessionalStorage,
  createProfessionalProfileSeed,
  ProfessionalStorage,
} from 'fireux-jobs/runtime/models/profiles/Professional/Professional.model.ts'

export default createProfileProvisionHandler({
  id: 'professional',
  label: 'Professional',
  root: {
    collection: ProfessionalStorage.rootCollection,
    seed: createProfessionalProfileSeed,
  },
  app: {
    collection: AppProfessionalStorage.collection,
    seed: () => ({}),
  },
})
