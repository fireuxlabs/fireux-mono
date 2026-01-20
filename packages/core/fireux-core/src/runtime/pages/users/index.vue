<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsUserCTA />
      <OrganismsUserCollectionManager :collection="users" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useGlobalUserCollection } from '../../composables/fireux/firestore/core/user/fetch/useGlobalUserCollection'

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

const { users } = useGlobalUserCollection()
</script>
