<!-- FILE: packages/core/fireux-core/src/runtime/pages/dev/users.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <UCard v-if="currentUser" class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h1 class="text-base font-semibold">Current User</h1>
          </div>
        </template>

        <OrganismsUserCardsPill :user="pillFor(currentUser)" />

        <p class="text-sm font-mono text-gray-600">
          ID: <span class="text-black">{{ currentUser.id }}</span>
        </p>

        <!-- This JSON now includes `appUser` because it's merged into `user` -->
        <DevJsonPanel v-if="currentUserJson" :data="currentUserJson" />
      </UCard>
      <MoleculesNotFound
        v-else
        kind="document"
        entity="user"
        :loading="isLoading"
      />

      <UCard v-if="users.length" class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Users Collection</h2>
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OrganismsUserCardsPill
            v-for="u in users"
            :key="u.id"
            :user="pillFor(u)"
          />
        </div>

        <DevJsonPanel v-if="usersJson" :data="usersJson" />
      </UCard>
      <MoleculesNotFound v-else kind="collection" entity="users" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useUser } from '../../composables/firestore/core/user/useUser'
import { useUserCollection } from '../../composables/firestore/core/user/main/useUserCollection'
import { useUserInterface } from '../../composables/firestore/core/user/state/useUserInterface'

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

const { currentUser, isLoading } = useUser()
const { users: usersCollection } = useUserCollection()
const { pillProps: collectionPill } = useUserInterface()

const pillFor = (target: User | any | null | undefined) => {
  if (!target) return null
  const base = target?.coreUser ?? target
  return collectionPill(base)
}

const currentUserJson = computed(() => currentUser.value ?? null)

const users = computed(() => usersCollection.value ?? [])

const usersJson = computed(() => {
  const list = users.value
  return list.length ? list : null
})
</script>
