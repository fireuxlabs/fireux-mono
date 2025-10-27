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
import { useUser } from '../../composables/firestore/core/user/useUser'

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

const { user, collection, pillProps } = useUser()

const pillFor = computed(() => pillProps.value)

const currentUser = computed(() => user.value ?? null)

const currentUserLink = computed(() => {
  const u = currentUser.value
  return u ? pillFor.value(u).to : null
})

const currentUserJson = computed(() => currentUser.value ?? null)

const users = computed(() => collection.value ?? [])

const usersJson = computed(() => {
  const list = users.value
  return list.length ? list : null
})
</script>
