<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/kitchens/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsObjectsKitchenCTA />
      <OrganismsObjectsKitchenCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

definePageMeta({
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Kitchens',
  description: 'Kitchen overlays resolved for this runtime.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'
const pageDescription =
  'Create a kitchen and browse all kitchens available to this runtime.'

useHead({ title: pageTitle })
</script>
