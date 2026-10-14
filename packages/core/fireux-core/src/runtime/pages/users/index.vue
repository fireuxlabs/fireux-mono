<template>
  <UPage>
    <UPageBody>
      <UserHero :title="pageTitle" />
      <ClientOnly>
        <UserCurrent v-if="currentUser" :current-user="currentUser" />
        <UserCreate v-else />
      </ClientOnly>
      <MoleculesStateCard
        v-if="outcome === 'pending'"
        entity="users"
        kind="collection"
        loading
      />
      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="users"
        kind="collection"
        state="error"
      />
      <MoleculesStateCard
        v-else-if="outcome === 'empty'"
        entity="users"
        kind="collection"
        state="empty"
      />
      <UserCollection
        v-show="outcome === 'ready'"
        :users="users"
        :has-more="hasMore"
      />
      <UButton v-if="hasMore" class="mt-4" @click="loadMore"
        >Load more users</UButton
      >
      <DiagnosticsDebugPanel
        title="Users index acquisition"
        context="Canonical Users and current identity inputs used by the FL index surface."
        object-origin="fetched"
        :objects="{ users, currentUser, appUser }"
        :derived="{
          count: users.length,
          currentSurface: currentUser ? 'current' : 'create',
        }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUserSession } from '../../user/composables/session/useUserSession'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useUserDirectory } from '../../user/composables/directory/useUserDirectory'

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

const { appName } = useFireUXConfig()
const { users, outcome, hasMore, loadMore } = useUserDirectory()
const { user: currentUser, appUser } = useUserSession()

const pageTitle = 'Users'
const pageDescription = 'Browse user profiles.'
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/users',
  robots: 'index, follow',
})
</script>
