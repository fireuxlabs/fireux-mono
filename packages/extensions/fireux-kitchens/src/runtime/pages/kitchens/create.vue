<template>
  <UPage>
    <UPageHeader
      title="Claim or Activate a Kitchen"
      description="Select a real location to manage in FireUX."
    />

    <UPageBody class="pagebody">
      <KitchenCreateSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import KitchenCreateSystem from '../../components/organisms/Kitchen/Create/System.vue'

definePageMeta({
  layout: 'default',
  title: 'Activate Kitchen',
  description: 'Select a real location to manage in FireUX.',
  nav: {
    key: 'kitchens-create',
    label: 'Activate kitchen',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Activate Kitchen' },
  name: 'KitchensCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Activate Kitchen` })
</script>
