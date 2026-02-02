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
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'

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
  description: 'Kitchen collection records resolved for this runtime.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'
const pageDescription =
  'Create a kitchen and browse all kitchens available to this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()

const collection = computed(() => kitchens.value ?? [])
</script>
