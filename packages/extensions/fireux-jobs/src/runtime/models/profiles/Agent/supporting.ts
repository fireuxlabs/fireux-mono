// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts

/**
 * Domain-level supporting structures for Agent profiles.
 * Keep runtime metadata separate from UI view models
 * so model imports stay Firestore-shape-only.
 */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

export const agentConfig: ProfileConfig = {
  id: 'agent',
  collectionName: 'agents',
  profileType: 'Agent',
  cta: 'Create your Agent profile to appear in listings.',
  navLabel: 'Agent',
  navIcon: 'i-lucide-shield-user',
} as const
