<template>
  <UPage>
    <UPageHeader
      title="Create Kitchen"
      description="Coming (kitchen) creation-soon"
    />

    <UPageBody class="pagebody" />
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Create Kitchen',
  description: 'Create a kitchen record.',
  nav: {
    key: 'kitchens-create',
    label: 'Create kitchen',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Create Kitchen' },
  name: 'KitchensCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Create Kitchen` })
</script>
