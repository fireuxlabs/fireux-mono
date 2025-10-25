<template>
  <div class="space-y-6">
    <!-- CURRENT USER -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-base font-semibold">Current User</h1>
          <div class="flex items-center gap-2">
            <UButton
              v-if="user"
              size="xs"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyJSON(user)"
            >
              Copy JSON
            </UButton>
            <UButton
              v-if="currentUserJson"
              size="xs"
              variant="ghost"
              :icon="
                showCurrentJson
                  ? 'i-lucide-chevron-up'
                  : 'i-lucide-chevron-down'
              "
              @click="toggleCurrentJson"
            >
              {{ showCurrentJson ? 'Hide JSON' : 'Show JSON' }}
            </UButton>
          </div>
        </div>
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

      <pre
        v-if="showCurrentJson && currentUserJson"
        class="mt-4 overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100"
        >{{ currentUserJson }}
      </pre>
    </UCard>

    <!-- USERS COLLECTION -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">Users Collection</h2>
          <div class="flex items-center gap-2">
            <UButton
              v-if="users.length"
              size="xs"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyJSON(users)"
            >
              Copy JSON
            </UButton>
            <UButton
              v-if="usersJson"
              size="xs"
              variant="ghost"
              :icon="
                showUsersJson ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
              "
              @click="toggleUsersJson"
            >
              {{ showUsersJson ? 'Hide JSON' : 'Show JSON' }}
            </UButton>
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

      <pre
        v-if="showUsersJson && usersJson"
        class="mt-4 overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100"
        >{{ usersJson }}
      </pre>
    </UCard>

    <!-- APP USERS SUBCOLLECTION -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">App Users</h2>
          <div class="flex items-center gap-2">
            <UButton
              v-if="appUsers.length"
              size="xs"
              variant="ghost"
              icon="i-lucide-copy"
              @click="copyJSON(appUsers)"
            >
              Copy JSON
            </UButton>
            <UButton
              v-if="appUsersJson"
              size="xs"
              variant="ghost"
              :icon="
                showAppUsersJson
                  ? 'i-lucide-chevron-up'
                  : 'i-lucide-chevron-down'
              "
              @click="toggleAppUsersJson"
            >
              {{ showAppUsersJson ? 'Hide JSON' : 'Show JSON' }}
            </UButton>
          </div>
        </div>
      </template>

      <div
        v-if="appUsers.length"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <UCard v-for="au in appUsers" :key="au.id" class="text-sm">
          <div class="truncate font-medium text-slate-700 dark:text-slate-200">
            {{ au.display_name || au.id }}
          </div>
          <div class="truncate text-xs text-slate-500 dark:text-slate-400">
            {{ au.role || 'user' }}
          </div>
        </UCard>
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        App users subcollection is not available for this runtime.
      </p>

      <pre
        v-if="showAppUsersJson && appUsersJson"
        class="mt-4 overflow-auto rounded-md bg-slate-950/90 p-4 text-xs text-slate-100"
        >{{ appUsersJson }}
      </pre>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/users'],
  nav: {
    key: 'dev-users',
    label: 'Users',
    icon: 'i-lucide-users',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

const { isTenant } = useFireUXConfig()
const { user, collection, badges, initialsFor } = useUser()
const { subcollections } = useApp()

const users = computed(() =>
  isTenant ? subcollections?.users?.value ?? [] : collection.global?.value ?? []
)

const appUsers = computed(() => (isTenant ? collection.local?.value ?? [] : []))

const emptyMessage = computed(() =>
  isTenant ? 'No users found in this app.' : 'No users found.'
)

const currentUserJson = computed(() =>
  user.value ? JSON.stringify(user.value, null, 2) : null
)

const usersJson = computed(() =>
  users.value.length ? JSON.stringify(users.value, null, 2) : null
)
const appUsersJson = computed(() =>
  appUsers.value.length ? JSON.stringify(appUsers.value, null, 2) : null
)

const showUsersJson = ref(false)
const showAppUsersJson = ref(false)
const showCurrentJson = ref(false)

function toggleUsersJson() {
  showUsersJson.value = !showUsersJson.value
}

function toggleAppUsersJson() {
  showAppUsersJson.value = !showAppUsersJson.value
}

function toggleCurrentJson() {
  showCurrentJson.value = !showCurrentJson.value
}

async function copyJSON(payload: unknown) {
  if (!payload || typeof navigator === 'undefined') {
    return
  }

  try {
    await navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
  } catch (error) {
    console.error('[dev/users] Failed to copy JSON', error)
  }
}
</script>
