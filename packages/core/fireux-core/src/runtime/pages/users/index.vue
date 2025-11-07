<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Core user -->
      <UCard v-if="coreUser">
        <template #header><h2>Core User</h2></template>
        <MoleculesPill v-bind="pillProps(coreUser)" class="mb-3" />
      </UCard>

      <!-- App user (tenant overlay) -->
      <UCard v-if="appUser">
        <template #header><h2>App User</h2></template>

        <!-- Use coreUser for identity visuals -->
        <MoleculesPill v-bind="pillProps(coreUser)" class="mb-3" />

        <!-- Overlay-specific bits from appUser -->
        <div class="mt-3 text-sm opacity-80">
          <div v-if="appUser.role">
            Role: <UBadge variant="soft">{{ appUser.role }}</UBadge>
          </div>
          <div v-else>No app-specific role set.</div>
        </div>
      </UCard>

      <!-- Users collection -->
      <UCard>
        <template #header><h2>Users</h2></template>
        <div
          v-if="users?.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MoleculesPill v-for="u in users" :key="u.id" v-bind="pillProps(u)" />
        </div>
        <p v-else class="text-sm opacity-70">No users found.</p>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'

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
})

const { coreUser, appUser, pillProps } = useUser()
const { users } = useUserCollection()
</script>
