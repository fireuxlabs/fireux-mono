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
  AppUserDoc,
  CoreUserDoc,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

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
    const docs = collection.local?.value as AppUserDoc[] | undefined
    if (!docs || !docs.length) return []
    return docs.map((doc) => ({
      ...doc,
      role: doc.role,
      app: doc,
    }))
  }

  const docs = collection.global?.value as CoreUserDoc[] | undefined
  if (!docs || !docs.length) return []
  return docs.map((doc) => ({
    ...doc,
    userOf: doc.userOf,
    adminOf: doc.adminOf,
    core: doc,
  }))
})

const pillPropsFor = (target: User | null) =>
  target ? pillProps.value(target) : undefined
</script>
