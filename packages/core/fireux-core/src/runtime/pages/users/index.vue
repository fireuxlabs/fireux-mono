<template>
  <EntityCollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-users-round"
  >
    <!-- Directory family: use bounded canonical Users, not raw identity docs. -->
    <UserCollectionManager />
  </EntityCollectionPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useSeo } from '../../composables/fireux/seo/useSeo'

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

const pageTitle = 'Users'
const pageDescription = `Discover users and the profiles connected across ${appName}.`
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/users',
  robots: 'index, follow',
})
</script>
