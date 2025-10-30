<template>
  <DashboardEditStructure
    title="Your Profile"
    description="Manage your personal profile and account details."
    :hero="hero"
    :dev-data="user"
  >
    <UPageCard v-if="user" variant="subtle">
      <div class="grid gap-4 md:grid-cols-2">
        <OrganismsUserCardsProfile :user="user" />
        <OrganismsUserEdit :user="user" />
      </div>
    </UPageCard>

    <UCard v-else>
      <div class="py-8 text-center">
        <UIcon
          name="i-heroicons-user-circle"
          class="mx-auto mb-4 h-12 w-12 text-gray-400"
        />
        <p>Loading profile...</p>
      </div>
    </UCard>
  </DashboardEditStructure>
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

const { user: userRef, pillProps } = useUser()

const user = computed(() => userRef.value ?? null)

const hero = computed(() => {
  const value = user.value
  if (!value) return null
  return {
    pill: pillProps(value),
    cellComponent: 'OrganismsUserCardsCell',
    cellProps: {
      user: value,
    },
  }
})
</script>
