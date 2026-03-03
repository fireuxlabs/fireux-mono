import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  cta: 'Create your Chef profile to appear in listings.',
  navLabel: 'Chef',
  navIcon: 'i-lucide-chef-hat',
} as const
