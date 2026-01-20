<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/kitchens/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <KitchenCTA />
      <KitchenCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchens } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/useKitchens'
import type { Kitchen } from 'fireux-kitchens/runtime/models/objects/kitchen.model'

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

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { collection } = useKitchens<Kitchen>()
</script>
