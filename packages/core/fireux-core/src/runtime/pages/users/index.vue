<template>
  <UPage>
    <UserHero :title="page.title" />
    <UPageBody>
      <ClientOnly>
        <UserCurrent v-if="page.currentUser" :current-user="page.currentUser" />
        <UserCreate v-else />
      </ClientOnly>
      <FireState v-bind="page.state" />
      <UserCollection
        v-show="page.state.outcome === 'ready'"
        :users="page.users"
        :has-more="page.pagination?.hasMore ?? false"
      />
      <FireCollectionPagination
        v-if="page.pagination"
        v-bind="page.pagination"
        @load-more="page.loadMore"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUserCollectionPage } from '../../user/composables/useUserCollectionPage'

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
  description: 'Browse users.',
  layout: 'default',
  name: 'UsersIndexPage',
})

const page = useUserCollectionPage()
</script>
