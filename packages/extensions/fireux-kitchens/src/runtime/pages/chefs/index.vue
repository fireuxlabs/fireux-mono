<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <!-- Profile CTA family: Chef is a profile layer attached to a User. -->
      <ChefCTA />
      <ChefCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

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
  description: 'Browse chef profiles.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const pageTitle = 'Chefs'
const pageDescription =
  'Browse chef profiles, or create yours from your user profile.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

</script>
