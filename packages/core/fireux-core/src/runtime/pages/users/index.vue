<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsUserCTA />
      <OrganismsUserCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useGlobalUserCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useGlobalUserCollection'
import { computed } from 'vue'

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
const collection = computed(() => users.value ?? [])
</script>
