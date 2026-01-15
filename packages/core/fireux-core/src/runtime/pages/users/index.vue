<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsUserCTA />
      <OrganismsUserCollectionManager :cards="cards" :total="total" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
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

const { appName } = useFireUXConfig()

const pageTitle = 'Users'
const pageDescription =
  'Inspect the current user and browse all users available to this runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

const { users, count } = useGlobalUserCollection()
const { card: makeUserCard } = useUserInterface()

const cards = computed(() =>
  (users.value ?? [])
    .map((entry) => makeUserCard(entry as User))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => count.value ?? cards.value.length)
</script>
