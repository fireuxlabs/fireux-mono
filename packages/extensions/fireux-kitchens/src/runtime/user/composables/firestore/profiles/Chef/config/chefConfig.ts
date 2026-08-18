// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: bind Chef creation to its trusted endpoint.
import type { ProfileConfig } from 'fireux-core/runtime/models/utils/profile.model'

export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  cta: 'Create your Chef profile to appear in listings.',
  navLabel: 'Chef',
  navIcon: 'i-lucide-chef-hat',
  provisionRoute: '/api/internal/profiles/chef',
} as const
