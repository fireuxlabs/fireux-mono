<template>
  <UPage>
    <UPageBody>
      <UserHero :title="pageTitle" :description="pageDescription" />
      <UserCurrent
        v-if="currentUser"
        :current-user="currentUser"
        :current-profiles="appUser?.profiles || []"
      />
      <UserCreate v-else />
      <UserCollection :users="users" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useUser } from '../../user/composables/useUser'
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
const { users } = useUsers()
const { currentUser, appUser } = useUser()

const pageTitle = 'Users'
const pageDescription = `Discover users and the profiles connected across ${appName}.`
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/users',
  robots: 'index, follow',
})
</script>
