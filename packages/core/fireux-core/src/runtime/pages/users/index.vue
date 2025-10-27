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
import { useUser } from '../../composables/firestore/core/user/useUser'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

type CoreUserRecord = Omit<User, 'appUser'>

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
})

const { user: userRef, pillProps, collection } = useUser()

const currentUser = computed<User | null>(() => userRef.value ?? null)
const userLoading = computed(() => currentUser.value === null)

const usingLocalCollection = computed(() => Boolean(collection.local))

const collectionLoading = computed(() => {
  if (usingLocalCollection.value) return collection.local?.value === undefined
  return collection.global?.value === undefined
})

const userCollection = computed<User[]>(() => {
  if (usingLocalCollection.value) {
    const docs = collection.local?.value as AppUser[] | undefined
    if (!docs || !docs.length) return []
    return docs
      .map((doc) => ({
        ...doc,
        role: doc.role,
        appUser: doc,
      }))
      .filter(Boolean) as unknown as User[]
  }

  const docs = collection.global?.value as CoreUserRecord[] | undefined
  if (!docs || !docs.length) return []
  return docs
    .map((doc) => ({
      ...doc,
      userOf: doc.userOf,
      adminOf: doc.adminOf,
    }))
    .filter(Boolean) as unknown as User[]
})

const pillPropsFor = (target: User | null) =>
  target ? pillProps.value(target) : undefined
</script>
