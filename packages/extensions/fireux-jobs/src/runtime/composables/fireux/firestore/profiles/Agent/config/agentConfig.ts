// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: bind Agent creation to its trusted endpoint.
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const agentConfig: ProfileConfig = {
  id: 'agent',
  collectionName: 'agents',
  profileType: 'Agent',
  cta: 'Create your hiring profile to appear in listings.',
  navLabel: 'Hiring profile',
  navIcon: 'i-lucide-shield-user',
  provisionRoute: '/api/internal/profiles/agent',
} as const
