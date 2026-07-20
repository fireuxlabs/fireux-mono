// Profile family canon: docs/concepts/entities.md
// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: Driver public identity and app-private operations.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: seed required Driver coverage atomically.
// Concurrent edit — 2026-07-20 17:43 CEST — Repo Efficiency Pass 2 of 6: bind Driver creation to its trusted endpoint.
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const driverConfig: ProfileConfig = {
  id: 'driver',
  collectionName: 'drivers',
  profileType: 'Driver',
  cta: 'Create your Driver profile to accept kitchen delivery work.',
  navLabel: 'Driver',
  navIcon: 'i-lucide-car',
  provisionRoute: '/api/internal/profiles/driver',
  storage: 'root-and-app',
} as const
