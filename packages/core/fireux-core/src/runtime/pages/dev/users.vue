<template>
  <div class="space-y-6">
    <!-- CURRENT USER -->
    <UCard>
      <template #header>
        <h1 class="text-base font-semibold">Current User</h1>
      </template>

      <div v-if="user" class="space-y-4">
        <MoleculesPill
          :avatar="user.avatar"
          :title="user.display_name"
          :subtitle="user.email"
        />
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        No user resolved for this runtime.
      </p>
    </UCard>

    <!-- USERS COLLECTION -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">Users Collection</h2>
          <UButton
            v-if="users.length"
            size="xs"
            variant="ghost"
            icon="i-lucide-copy"
            @click="copyJSON(users)"
          >
            Copy JSON
          </UButton>
        </div>
      </template>

      <div v-if="users.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MoleculesPill
          v-for="u in users"
          :key="u.id"
          :avatar="u.avatar"
          :title="u.display_name"
          :subtitle="u.email || u.id"
        />
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        No users found.
      </p>
    </UCard>

    <!-- APP USERS SUBCOLLECTION -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">App Users</h2>
          <UButton
            v-if="appUsers.length"
            size="xs"
            variant="ghost"
            icon="i-lucide-copy"
            @click="copyJSON(appUsers)"
          >
            Copy JSON
          </UButton>
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
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
const { user, collection } = useUser()
const { subcollections } = useApp()

const users = computed(() =>
  isTenant ? collection.local?.value ?? [] : collection.global?.value ?? []
)

const appUsers = computed(() => subcollections?.users?.value ?? [])

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
