<!-- FILE: packages/core/fireux-core/src/runtime/pages/users.vue -->
<template>
  <div class="space-y-6">
    <!-- CURRENT USER -->
    <UCard>
      <template #header>
        <h1 class="text-base font-semibold">Current User</h1>
      </template>

      <div v-if="currentUser" class="space-y-4">
        <NuxtLink
          v-if="currentUserLink"
          :to="currentUserLink"
          class="block space-y-4 no-underline text-inherit"
        >
          <MoleculesPill
            :avatar="currentUser.avatar"
            :title="currentUser.display_name"
            :subtitle="currentUser.handle"
          />
          <OrganismsUserCardsCell
            v-if="currentUserCell"
            :user="currentUserCell"
          />
        </NuxtLink>
        <template v-else>
          <MoleculesPill
            :avatar="currentUser.avatar"
            :title="currentUser.display_name"
            :subtitle="currentUser.handle"
          />
          <OrganismsUserCardsCell
            v-if="currentUserCell"
            :user="currentUserCell"
          />
        </template>
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

          <UButton
            v-if="isTenant"
            size="xs"
            variant="soft"
            icon="i-lucide-database"
            @click="fetchUsers"
          >
            Load all users
          </UButton>
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
            :title="u.display_name"
            :subtitle="u.handle"
          />
        </NuxtLink>
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        <span v-if="isTenant">
          Users not loaded yet.
          <UButton size="xs" variant="link" class="ml-1" @click="fetchUsers">
            Load all users
          </UButton>
        </span>
        <span v-else>No users found.</span>
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
})

const { isTenant } = useFireUXConfig()
const { user, collection } = useUser()
const { subcollections } = useApp()

// exact current user (no fallbacks rendered)
const currentUser = computed(() => user.value ?? null)
const currentUserCell = computed(() => {
  const value = currentUser.value
  if (!value) return null
  return {
    id: value.id,
    display_name:
      value.display_name ?? value.handle ?? value.core?.display_name ?? 'User',
    avatar: value.avatar ?? value.core?.avatar ?? '',
    handle: value.handle ?? value.core?.handle,
    email: value.email ?? value.core?.email ?? null,
    profiles: value.profiles ?? value.core?.profiles ?? null,
    userOf: value.userOf ?? value.core?.userOf ?? null,
    adminOf: value.adminOf ?? value.core?.adminOf ?? null,
    role: value.role ?? value.app?.role,
  }
})
const currentUserLink = computed(() => {
  const id = currentUser.value?.id ?? ''
  return id ? `/users/${id}` : null
})

// tenant: merged app subcollection; global: global core-users collection
const users = computed(() => {
  if (isTenant) return subcollections?.users?.value ?? []
  return collection.global?.value ?? []
})

function fetchUsers() {
  if (!isTenant) return
  if (typeof subcollections?.fetchAll === 'function') {
    subcollections.fetchAll()
  }
}
</script>
