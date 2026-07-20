// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: declare Customer app-private.
// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: bind Customer creation to its trusted endpoint.
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const customerConfig: ProfileConfig = {
  id: 'customer',
  collectionName: 'customers',
  profileType: 'Customer',
  cta: 'Create your Customer profile to make ordering faster.',
  navLabel: 'Customer',
  navIcon: 'i-lucide-user-round',
  provisionRoute: '/api/internal/profiles/customer',
  storage: 'app-only',
} as const
