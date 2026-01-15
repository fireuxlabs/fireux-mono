<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Users"
      description="Inspect the current user and browse all users available to this runtime."
    />

    <UPageBody class="pagebody">
      <OrganismsUserCTA />
      <OrganismsUserCollectionManager
        :cards="userCards"
        :total="userCount"
        subtitle="Browse users in the global directory."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useGlobalUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useGlobalUserCollection'
import { useUserInterface } from '../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import type { User } from '../../models/core/user.model'

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
  description: 'FireUX users resolved for this runtime.',
  layout: 'default',
  name: 'UsersIndexPage',
})

useHead({ title: 'Users' })

const { users, count } = useGlobalUserCollection()
const { card: makeUserCard } = useUserInterface()

const userCards = computed(() =>
  (users.value ?? [])
    .map((entry) => makeUserCard(entry as User))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const userCount = computed(() => count.value ?? userCards.value.length)
</script>
