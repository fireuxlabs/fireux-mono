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

        <MoleculesPill v-bind="pillFor(currentUser)" />
        <OrganismsUserCardsCell :user="currentUser" :to="currentUserLink" />

        <DevJsonPanel v-if="currentUserJson" :data="currentUserJson" />
      </UCard>
      <MoleculesNotFound v-else kind="document" entity="user" />

      <UCard v-if="users.length" class="space-y-4">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold">Users Collection</h2>
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MoleculesPill v-for="u in users" :key="u.id" v-bind="pillFor(u)" />
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

const { user, pillProps } = useUser()
const { users: usersCollection } = useUserCollection()

const pillFor = (target: User | null | undefined) =>
  target ? pillProps(target) : null

const currentUser = computed(() => user.value ?? null)

const currentUserLink = computed(() => {
  const u = currentUser.value
  const pill = u ? pillProps(u) : null
  return pill?.to ?? null
})

const currentUserJson = computed(() => currentUser.value ?? null)

const users = computed(() => usersCollection.value ?? [])

const usersJson = computed(() => {
  const list = users.value
  return list.length ? list : null
})
</script>
