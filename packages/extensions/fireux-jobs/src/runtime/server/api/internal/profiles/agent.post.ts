// Concurrent edit — 2026-07-20 18:00 CEST — Repo Efficiency Pass 2 of 6: expose fixed trusted Agent provisioning.

import { createProfileProvisionHandler } from 'fireux-core/runtime/server/utils/profile/provision'
import {
  AgentStorage,
  AppAgentStorage,
  createAgentProfileSeed,
} from '../../../../models/profiles/Agent/Agent.model.ts'

export default createProfileProvisionHandler({
  id: 'agent',
  label: 'Agent',
  root: {
    collection: AgentStorage.rootCollection,
    seed: createAgentProfileSeed,
  },
  app: {
    collection: AppAgentStorage.collection,
    seed: () => ({}),
  },
})
