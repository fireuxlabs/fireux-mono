// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: bind Professional creation to its trusted endpoint.
import type { ProfileConfig } from 'fireux-core/runtime/models/utils/profile.model'

export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
  navLabel: 'Professional',
  navIcon: 'i-lucide-user-star',
  provisionRoute: '/api/internal/profiles/professional',
} as const
