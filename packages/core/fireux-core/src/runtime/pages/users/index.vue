<!-- FILE: packages/core/fireux-core/src/runtime/pages/users.vue -->
<template>
  <div class="space-y-6">
    <!-- CURRENT USER -->
    <UCard>
      <template #header>
        <h1 class="text-base font-semibold">Current User</h1>
      </template>

      <div v-if="user" class="space-y-4">
        <NuxtLink
          :to="`/users/${user.id}`"
          class="block no-underline text-inherit"
        >
          <MoleculesPill
            :avatar="user.avatar"
            :initials="initialsFor(user)"
            :title="user.display_name"
            :subtitle="user.handle"
            :badges="badges(user)"
          />
        </NuxtLink>

        <OrganismsUserCardsCell :user="user" />
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        No user resolved for this runtime.
      </p>
    </UCard>

    <!-- USERS COLLECTION -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-semibold">Users Collection</h2>
            <UBadge v-if="users.length" variant="subtle">{{
              users.length
            }}</UBadge>
          </div>
        </div>
      </template>

      <div v-if="users.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="u in users"
          :key="u.id"
          :to="`/users/${u.id}`"
          class="block no-underline text-inherit"
        >
          <MoleculesPill
            :avatar="u.avatar"
            :initials="initialsFor(u)"
            :title="u.display_name"
            :subtitle="u.handle"
            :badges="badges(u)"
          />
        </NuxtLink>
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        {{ emptyMessage }}
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp'

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
})

const { isTenant } = useFireUXConfig()
const { user, collection, badges, initialsFor } = useUser()
const { subcollections } = useApp()

// Tenant: merged app users; Global: core users
const users = computed(() =>
  isTenant ? subcollections?.users?.value ?? [] : collection.global?.value ?? []
)

const emptyMessage = computed(() =>
  isTenant ? 'No users found in this app.' : 'No users found.'
)
</script>
