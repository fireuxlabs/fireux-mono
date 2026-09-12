<template>
  <UPage>
    <UPageBody>
      <UserHero :title="pageTitle" :description="pageDescription" />
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
      <UserCollection :users="users" v-else />
      <DevDebugPanel
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
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useUsers } from '../../user/composables/useUsers'

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
const { users, outcome } = useUsers()
const { user: currentUser, appUser } = useUserSession()

const pageTitle = 'Users'
const pageDescription = `Discover users and the profiles connected across ${appName}.`
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/users',
  robots: 'index, follow',
})
</script>
