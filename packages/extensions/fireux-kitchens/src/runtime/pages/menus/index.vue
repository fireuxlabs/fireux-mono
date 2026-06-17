<template>
  <UPage>
    <!-- Index cannon: docs/index-cannon.readme · family: Public doorway/onboarding -->
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Upload or browse public menu doorways."
    />

    <UPageBody class="pagebody">
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
  description: 'Upload or browse public menu doorways.',
})

const pageTitle = 'Menus'
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | ${pageTitle}` })
</script>
