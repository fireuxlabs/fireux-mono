<template>
  <FireOrganismsProfilePage
    :profile-config="chefConfig"
    :cta-config="chefCtaConfig"
    :current-profile="currentChef"
    :profiles="chefs"
    :loading="loading"
    :app-users="appusers"
    :has-profile="hasChefProfile"
    :page-config="pageConfig"
    :status-config="statusConfig"
    :show-debug="true"
  >
    <template #profile-card="{ profile }">
      <MiseChefCardsProfile :chef="profile" />
    </template>

    <template #profile-list="{ profiles, loading }">
      <MiseChefList :chefs="profiles" :loading="loading" />
    </template>
  </FireOrganismsProfilePage>
</template>

<script setup>
import { chefConfig, chefCtaConfig } from '../../models/profiles/Chef.model'

// Set page meta
definePageMeta({
  title: 'Browse Chefs',
  description: 'Find talented chefs for your kitchen needs',
})

// Use the profile composable to fetch chefs
const {
  all: chefs,
  loading,
  current: currentChef,
} = await useProfile(chefConfig)

// Fetch app users to see what's in the collection
const { appUsers: appusers } = await useAppUser()

// Get current user and check if they have a chef profile
const { appUser } = await useAppUser()
const hasChefProfile = computed(() => {
  try {
    if (!appUser.value) return false
    return !!currentChef.value
  } catch (error) {
    console.warn('Error checking chef profile:', error)
    return false
  }
})

// Page configuration
const pageConfig = {
  title: 'Browse Chefs',
  description: 'Discover talented chefs available for hire and collaboration.',
}

// Status configuration
const statusConfig = {
  activeIcon: '✅',
  createIcon: '👨‍🍳',
  activeDescription:
    'Your chef profile is active and visible to potential clients.',
  createDescription:
    'Join our community of talented chefs and start connecting with potential clients.',
  viewProfileLink: '/dashboard/profile',
  editProfileLink: '/dashboard/profile',
}
</script>
