<template>
  <UPage>
    <UPageHeader class="border-b-0" :title="pageTitle" />
    <UPageBody class="pagebody">
      <KitchenCTA />
      <KitchenCollectionManager
        :collection="collection"
        title="Available Kitchens"
        description=""
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'

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
  description: 'Browse kitchens.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const collection = computed(() => kitchens.value ?? [])
</script>
