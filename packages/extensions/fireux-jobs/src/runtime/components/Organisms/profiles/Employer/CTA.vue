<template>
  <FireOrganismsProfileCurrentUserCTA
    :has-profile="!!currentEmployer"
    :current-profile="currentEmployer"
    :config="ctaConfig"
  >
    <template #profile-card="{ profile }">
      <FireOrganismsEmployerCardsProfile :employer="profile" />
    </template>

    <template #additional-actions="{ profile }">
      <UButton to="/jobs/post" variant="outline"> Post a Job </UButton>
    </template>
  </FireOrganismsProfileCurrentUserCTA>
</template>

<script setup>
// Get current employer profile if it exists
const { isEmployer, currentEmployer } = useEmployers()

// CTA Configuration
const ctaConfig = {
  // Icons
  createIcon: '🏢',
  activeIcon: '✅',

  // Titles
  createTitle: 'Create your Employer profile',
  activeTitle: 'You have an Employer profile',

  // Descriptions
  createDescription:
    'Set up your company profile to start posting jobs and connecting with professionals.',
  activeDescription:
    'Your employer profile is active and ready to connect with talented professionals.',

  // Benefits for signup
  benefits: [
    '🏢 Showcase your company and culture',
    '👥 Connect with skilled culinary professionals',
    '📝 Post job opportunities and openings',
    '🎯 Find the perfect candidates for your team',
  ],

  // Links
  createProfileLink: '/dashboard/employer-profile',
  viewProfileLink: '/dashboard/employer-profile',
  editProfileLink: '/dashboard/employer-profile',

  // Button text
  createButtonText: 'Create Employer Profile',
}
</script>
