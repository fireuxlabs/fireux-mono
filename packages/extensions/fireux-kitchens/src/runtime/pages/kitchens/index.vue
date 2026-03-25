<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />
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
import KitchenCTA from '../../components/organisms/Kitchen/CTA.vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'

definePageMeta({
  tag: 'kitchens',
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
const pageDescription = 'Choose a kitchen surface for this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const collection = computed(() => kitchens.value ?? [])
</script>
