<template>
  <UPage>
    <!-- Index map: docs/concepts/family-public-index.md · family: Menu public index -->
    <UPageHeader
      :title="pageTitle"
      description="Start with a simple menu QR, then grow into a Kitchen Console when you're ready."
    />
    <UPageBody>
      <MenuCTA />
      <MenuCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'menus',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'MenusIndexPage',
  title: 'Menus',
  description: "Start with a simple menu QR, then grow into a Kitchen Console when you're ready.",
})

const pageTitle = 'Menus'
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | ${pageTitle}` })
</script>
