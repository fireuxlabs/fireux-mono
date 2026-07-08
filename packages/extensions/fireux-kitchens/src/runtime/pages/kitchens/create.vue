<template>
  <UPage>
    <UPageHeader
      title="Create Kitchen"
      description="Create the public kitchen record for a real venue. Setup continues on the kitchen edit page."
    />

    <UPageBody class="pagebody">
      <KitchenCreateSystem mode="public" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import KitchenCreateSystem from '../../components/Kitchen/Create/System.vue'

definePageMeta({
  layout: 'default',
  title: 'Create Kitchen',
  description: 'Create the public kitchen record for a real venue.',
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
