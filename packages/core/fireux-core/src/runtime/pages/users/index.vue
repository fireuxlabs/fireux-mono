<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageBody class="space-y-6">
      <!-- Current User -->
      <UCard v-if="currentUser" class="space-y-4">
        <MoleculesPill v-if="pillForCurrentUser" v-bind="pillForCurrentUser" />
        <OrganismsUserCardsCell :user="currentUser" />
      </UCard>

      <MoleculesNotFound
        v-else
        kind="document"
        entity="user"
        :loading="isLoading"
      />

      <!-- Users Collection -->
      <UCard>
        <div
          v-if="visibleUsers.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MoleculesPill
            v-for="u in visibleUsers"
            :key="u.id"
            v-bind="pillProps(u)"
          />
        </div>
        <MoleculesNotFound v-else kind="collection" entity="users" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '../../composables/firestore/core/user/useUser'
import { useUserCollection } from '../../composables/firestore/core/user/main/useUserCollection'

definePageMeta({
  nav: { key: 'users', label: 'Users', icon: 'i-lucide-users' },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
})

const { user, pillProps, isLoading } = useUser()
const { users } = useUserCollection()

const currentUser = computed(() => user.value ?? null)

const pillForCurrentUser = computed(() => {
  const value = currentUser.value
  if (!value) return null
  if (!value.avatar || !value.display_name) return null
  return pillProps(value)
})

const visibleUsers = computed(() =>
  (users.value ?? []).filter((entry) => entry.avatar && entry.display_name)
)
</script>
