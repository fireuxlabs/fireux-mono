<template>
  <client-only>
    <div v-if="user">
      <UPageCard variant="naked" orientation="horizontal" class="mb-4">
        <div
          class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
        >
          <MoleculesPill
            :avatar="user.avatar"
            :initials="initialsFor(user)"
            :title="user.display_name"
            :subtitle="user.handle"
            :badges="badges(user)"
            class="md:max-w-sm"
          />
          <OrganismsUserCardsCell :user="user" class="md:max-w-md" />
        </div>
      </UPageCard>

      <UPageCard variant="subtle">
        <div class="grid gap-4 md:grid-cols-2">
          <OrganismsUserCardsProfile :user="user" />
          <OrganismsUserEdit :user="user" />
        </div>
      </UPageCard>
    </div>
    <div v-else>
      <UCard>
        <div class="text-center py-8">
          <UIcon
            name="i-heroicons-user-circle"
            class="w-12 h-12 mx-auto mb-4 text-gray-400"
          />
          <p>Loading profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser'

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

useHead({ title: 'Your Profile' })

const { user, badges, initialsFor } = useUser()
</script>
