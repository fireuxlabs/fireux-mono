// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Chef provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision.ts'
import {
  AppChefStorage,
  ChefStorage,
  createChefProfileSeed,
} from 'fireux-kitchens/runtime/models/chef.model.ts'

export default createProfileProvisionHandler({
  id: 'chef',
  label: 'Chef',
  root: {
    collection: ChefStorage.rootCollection,
    seed: createChefProfileSeed,
  },
  app: {
    collection: AppChefStorage.collection,
    seed: () => ({}),
  },
})
