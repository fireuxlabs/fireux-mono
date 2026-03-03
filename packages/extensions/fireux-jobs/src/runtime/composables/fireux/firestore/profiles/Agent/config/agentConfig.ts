import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const agentConfig: ProfileConfig = {
  id: 'agent',
  collectionName: 'agents',
  profileType: 'Agent',
  cta: 'Create your Agent profile to appear in listings.',
  navLabel: 'Agent',
  navIcon: 'i-lucide-shield-user',
} as const
