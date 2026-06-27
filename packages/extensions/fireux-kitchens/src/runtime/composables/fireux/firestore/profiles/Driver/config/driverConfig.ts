// Profile family canon: docs/concepts/entities.md
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const driverConfig: ProfileConfig = {
  id: 'driver',
  collectionName: 'drivers',
  profileType: 'Driver',
  cta: 'Create your Driver profile to accept kitchen delivery work.',
  navLabel: 'Driver',
  navIcon: 'i-lucide-car',
} as const
