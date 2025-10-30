<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <template v-if="currentUser">
        <UCard class="space-y-4">
          <MoleculesPill v-bind="pillPropsFor(currentUser)" />
          <OrganismsUserCardsCell :user="currentUser" />
        </UCard>
      </template>
      <MoleculesNotFound
        v-else
        kind="document"
        entity="user"
        :loading="userLoading"
      />

      <UCard>
        <div
          v-if="userCollection.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MoleculesPill
            v-for="u in userCollection"
            :key="u.id"
            v-bind="pillPropsFor(u)"
          />
        </div>
        <MoleculesNotFound
          v-else
          kind="collection"
          entity="users"
          :loading="collectionLoading"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import { useUser } from '../../composables/firestore/core/user/useUser'
import { useUserCollection } from '../../composables/firestore/core/user/main/useUserCollection'

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
})

const { user: userRef, pillProps } = useUser()
const { users, global, local } = useUserCollection()

const currentUser = computed<User | null>(() => userRef.value ?? null)
const userLoading = computed(() => currentUser.value === null)

const usingLocalCollection = computed(() => Boolean(local))

const collectionLoading = computed(() => {
  if (usingLocalCollection.value) return local?.value === undefined
  return global.value === undefined
})

const userCollection = computed<User[]>(() => {
  return users.value ?? []
})

const pillPropsFor = (target: User | null) =>
  target ? pillProps(target) : undefined
</script>
