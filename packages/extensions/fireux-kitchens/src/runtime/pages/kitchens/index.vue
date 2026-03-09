<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Kitchen index for the current runtime."
    />
    <UPageBody class="pagebody space-y-6">
      <EntityIndexCta
        title="Kitchens index"
        description="Browse kitchen records for this runtime and jump into the kitchen console when you need to manage service operations."
        source="runtime kitchens collection"
        :count-label="`${collection.length} kitchen${collection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />
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

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const collection = computed(() => kitchens.value ?? [])
const actions = [
  {
    label: 'Kitchen Console',
    cta: 'Open overview',
    to: '/console/kitchen/overview',
    icon: 'i-lucide-chef-hat',
  },
  {
    label: 'Create',
    cta: 'Create kitchen',
    to: '/kitchens/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/kitchens/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
