// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: declare Customer app-private.
// Profile family canon: docs/concepts/entities.md
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const customerConfig: ProfileConfig = {
  id: 'customer',
  collectionName: 'customers',
  profileType: 'Customer',
  cta: 'Create your Customer profile to make ordering faster.',
  navLabel: 'Customer',
  navIcon: 'i-lucide-user-round',
  storage: 'app-only',
} as const
