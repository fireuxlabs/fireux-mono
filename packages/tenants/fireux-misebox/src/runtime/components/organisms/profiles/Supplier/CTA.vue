<template>
  <FireOrganismsProfileCurrentUserCTA
    :has-profile="!!currentSupplier"
    :current-profile="currentSupplier"
    :config="ctaConfig"
  >
    <template #profile-card="{ profile }">
      <MiseSupplierCardsProfile :supplier="profile" />
    </template>

    <template #additional-actions="{ profile }">
      <UButton to="/products/create" variant="outline"> Add Products </UButton>
    </template>
  </FireOrganismsProfileCurrentUserCTA>
</template>

<script setup>
import { supplierConfig } from '../../../models/profiles/Supplier.model'

// Get current supplier profile if it exists
const { current: currentSupplier } = await useProfile(supplierConfig)

// CTA Configuration
const ctaConfig = {
  // Icons
  createIcon: '🚚',
  activeIcon: '✅',

  // Titles
  createTitle: 'Become a Misebox Supplier',
  activeTitle: 'Welcome back, Supplier!',

  // Descriptions
  createDescription:
    'Join our network of trusted suppliers and connect with chefs and restaurants looking for quality ingredients.',
  activeDescription:
    'Your supplier profile is active and visible to potential clients.',

  // Benefits for signup
  benefits: [
    '🏪 Showcase your business and products',
    '🤝 Connect with chefs and restaurants',
    '📦 List your products and inventory',
    '💼 Build lasting business relationships',
  ],

  // Links
  createProfileLink: '/suppliers/create',
  viewProfileLink: currentSupplier?.id
    ? `/suppliers/${currentSupplier.id}`
    : null,
  editProfileLink: '/dashboard/profile',

  // Button text
  createButtonText: 'Create Supplier Profile',
}
</script>
