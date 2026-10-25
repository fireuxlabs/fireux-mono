<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <ChefDirectory />
      <!-- Profile CTA family: Chef is a profile layer attached to a User. -->
      <ChefCurrent />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  tag: 'chefs',
  nav: {
    visibility: { profiles: ['chef'] },
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-egg-fried',
    order: 40,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Chefs',
  description:
    'Discover chefs, their craft, and the kitchens they help bring to life.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const pageTitle = 'Chefs'
const pageDescription =
  'Discover chefs, their craft, and the kitchens they help bring to life.'

const { appName } = useFireUXConfig()
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/chefs',
})
</script>
