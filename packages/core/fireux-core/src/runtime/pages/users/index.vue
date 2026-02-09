<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <UCard v-if="isDev">
        <DevJson
          title="Current User (dev)"
          context="Users index · current user and kitchens runtime summary"
          :data="currentUserDevPayload"
          :default-open="false"
        />
      </UCard>

      <OrganismsUserCTA />
      <OrganismsUserCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useGlobalUserCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useGlobalUserCollection'
import { computed } from 'vue'

definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: false,
    mobile: false,
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

const isDev = import.meta.dev

const {
  user: currentUser,
  myKitchenIds,
  hasTestKitchen,
  myPrimaryKitchenId,
} = useUser()

const currentUserId = computed(() => String(currentUser.value?.id || '').trim())

const currentUserSummary = computed(() => ({
  id: currentUserId.value || null,
  displayName: currentUser.value?.display_name || null,
  handle: currentUser.value?.handle || null,
  email: currentUser.value?.email || null,
  profiles: currentUser.value?.profiles ?? [],
  adminOf: currentUser.value?.adminOf ?? [],
  userOf: currentUser.value?.userOf ?? [],
}))

const kitchensSummary = computed(() => ({
  claimed: {
    ids: myKitchenIds.value,
    count: myKitchenIds.value.length,
  },
  hasTestKitchen: hasTestKitchen.value,
  primaryKitchenId: myPrimaryKitchenId.value || null,
}))

const currentUserDevPayload = computed(() => ({
  userId: currentUserId.value || null,
  currentUser: currentUserSummary.value,
  kitchens: kitchensSummary.value,
}))
</script>
