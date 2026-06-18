<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Find and join kitchens, or create your own Kitchen Console."
    />

    <UPageBody>
      <!-- Console CTA family: actions live in KitchenCTA; browse lives in KitchenCollectionManager. -->
      <KitchenCTA />

      <KitchenCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'kitchens',
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'KitchensIndexPage',
  title: 'Kitchens',
  description: 'Find and join kitchens, or create your own Kitchen Console.',
})

const pageTitle = 'Kitchens'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
