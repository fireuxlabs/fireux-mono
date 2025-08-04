<template>
  <FireOrganismsProfilePage
    :profile-config="supplierConfig"
    :cta-config="supplierCtaConfig"
    :current-profile="currentSupplier"
    :profiles="suppliers"
    :loading="loading"
    :app-users="appusers"
    :has-profile="hasSupplierProfile"
    :page-config="pageConfig"
    :status-config="statusConfig"
    :show-debug="true"
  >
    <template #profile-card="{ profile }">
      <MiseSupplierCardsProfile :supplier="profile" />
    </template>

    <template #profile-list="{ profiles, loading }">
      <MiseSupplierList :suppliers="profiles" :loading="loading" />
    </template>
  </FireOrganismsProfilePage>
</template>

<script setup>
import {
  supplierConfig,
  supplierCtaConfig,
} from '../../models/profiles/Supplier.model'

// Set page meta
definePageMeta({
  title: 'Browse Suppliers',
  description:
    'Find reliable suppliers for your restaurant and food business needs',
})

// Use the profile composable to fetch suppliers
const {
  all: suppliers,
  loading,
  current: currentSupplier,
} = await useProfile(supplierConfig)

// Fetch app users to see what's in the collection
const { appUsers: appusers } = await useAppUser()

// Get current user and check if they have a supplier profile
const { appUser } = await useAppUser()
const hasSupplierProfile = computed(() => {
  try {
    if (!appUser.value) return false
    return !!currentSupplier.value
  } catch (error) {
    console.warn('Error checking supplier profile:', error)
    return false
  }
})

// Page configuration
const pageConfig = {
  title: 'Browse Suppliers',
  description:
    'Discover reliable suppliers for your restaurant and food business needs.',
}

// Status configuration
const statusConfig = {
  activeIcon: '✅',
  createIcon: '🚛',
  activeDescription:
    'Your supplier profile is active and visible to potential buyers.',
  createDescription:
    'Join our community of trusted suppliers and start connecting with restaurants and food businesses.',
  viewProfileLink: '/dashboard/profile',
  editProfileLink: '/dashboard/profile',
}
</script>
