<template>
  <FireOrganismsProfileCurrentUserCTA
    :has-profile="!!currentProfessional"
    :current-profile="currentProfessional"
    :config="ctaConfig"
  >
    <template #profile-card="{ profile }">
      <FireOrganismsProfessionalCardsProfile :professional="profile" />
    </template>

    <template #additional-actions="{ profile }">
      <UButton to="/jobs" variant="outline"> Browse Jobs </UButton>
    </template>
  </FireOrganismsProfileCurrentUserCTA>
</template>

<script setup>
// Get current professional profile if it exists
const { isProfessional, currentProfessional } = useProfessionals()

// CTA Configuration
const ctaConfig = {
  // Icons
  createIcon: '💼',
  activeIcon: '✅',

  // Titles
  createTitle: 'Create your Professional profile',
  activeTitle: 'You have a Professional profile',

  // Descriptions
  createDescription:
    'Join our network of skilled professionals and connect with potential employers.',
  activeDescription:
    'Your professional profile is active and visible to potential employers.',

  // Benefits for signup
  benefits: [
    '📝 Showcase your professional skills and experience',
    '🏢 Connect with employers and job opportunities',
    '🎯 Get matched with relevant positions',
    '💼 Build your culinary career network',
  ],

  // Links
  createProfileLink: '/dashboard/professional-profile',
  viewProfileLink: '/dashboard/professional-profile',
  editProfileLink: '/dashboard/professional-profile',

  // Button text
  createButtonText: 'Create Professional Profile',
}
</script>
