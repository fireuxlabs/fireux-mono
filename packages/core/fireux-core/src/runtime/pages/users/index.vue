<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Core user (global) -->
      <UCard v-if="coreUser">
        <template #header><h2>Core User (raw)</h2></template>
        <pre class="text-xs whitespace-pre-wrap">{{ coreUser }}</pre>
      </UCard>
      <UCard v-else>
        <template #header><h2>Core User</h2></template>
        <p class="text-sm opacity-70">No core user loaded (not signed in?).</p>
      </UCard>

      <!-- App user (tenant overlay) -->
      <UCard v-if="appUser">
        <template #header><h2>App User (raw)</h2></template>
        <pre class="text-xs whitespace-pre-wrap">{{ appUser }}</pre>
      </UCard>
      <UCard v-else>
        <template #header><h2>App User</h2></template>
        <p class="text-sm opacity-70">
          No app user for this app (or no app selected).
        </p>
      </UCard>

      <!-- Users collection -->
      <UCard>
        <template #header><h2>All Users (raw)</h2></template>
        <template v-if="users?.length">
          <pre class="text-xs whitespace-pre-wrap">{{ users }}</pre>
        </template>
        <p v-else class="text-sm opacity-70">No users found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'

// Full page meta (nav + SEO)
definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
  layout: 'default',
  name: 'UsersIndexPage',
})

// Returned refs are already auto-unwrapped in templates
const { coreUser, appUser } = useUser()
const { users } = useUserCollection()
</script>
