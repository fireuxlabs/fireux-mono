<template>
  <UPage>
    <UPageHeader
      title="Create Business"
      description="Create or reuse a business from a canonical place record."
    />

    <UPageBody class="pagebody">
      <BusinessCreateSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Create Business',
  description: 'Create a business record.',
  nav: {
    key: 'businesses-create',
    label: 'Create business',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Create Business' },
  name: 'BusinessesCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Create Business` })
</script>
