<!-- packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue -->
<template>
  <LayoutsDashboardEditStructure
    title="Your Profile"
    description="Manage your personal profile and account details."
    :hero="hero"
    :dev-data="currentUser"
  >
    <UPageCard v-if="currentUser" variant="subtle">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <OrganismsUserCardsPill :user="currentUserPill" />
            <OrganismsUserCardsCell :user="currentUser" :to="userLink" />
          </div>
          <OrganismsUserCardsProfile :user="currentUser" />
        </div>

        <OrganismsUserEdit :user="currentUser" />
      </div>
    </UPageCard>

    <UCard v-else>
      <div class="py-8 text-center">
        <UIcon
          name="i-heroicons-user-circle"
          class="mx-auto mb-4 h-12 w-12 text-gray-400"
        />
        <p>{{ isLoading ? 'Loading profile...' : 'Profile not found.' }}</p>
      </div>
    </UCard>
  </LayoutsDashboardEditStructure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../composables/firestore/core/user/useUser'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'User Profile',
    icon: 'i-lucide-user',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const useHeadFn = (globalThis as any).useHead as
  | undefined
  | ((input: any) => void)
useHeadFn?.({ title: 'Your Profile' })

const { currentUser, pillProps, isLoading } = useUser()

const currentUserPill = computed(() =>
  currentUser.value ? pillProps(currentUser.value) : null
)
const userLink = computed(() =>
  currentUser.value?.id ? `/users/${currentUser.value.id}` : null
)

const hero = computed(() => {
  const value = currentUser.value
  if (!value) return null
  const pill = currentUserPill.value
  return {
    pillComponent: 'OrganismsUserCardsPill',
    pillProps: pill ? { user: pill } : null,
    cellComponent: 'OrganismsUserCardsCell',
    cellProps: {
      user: value,
    },
  }
})
</script>
