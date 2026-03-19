<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />
    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Kitchens index"
        description="Browse canonical kitchen records for this runtime. Runtime-mode selection and console entry live in the dashboard kitchen workspace."
        family="special"
        source="kitchens collection"
        :count-label="`${collection.length} kitchen${collection.length === 1 ? '' : 's'}`"
        :actions="actions"
      />
      <KitchenCollectionManager :collection="collection" />
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
const pageDescription = 'Canonical kitchen index for the current runtime.'

const actions = [
  {
    label: 'Create',
    cta: 'Create kitchen',
    to: '/kitchens/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Runtime',
    cta: 'Open kitchen dashboard',
    to: '/dashboard/kitchens',
    icon: 'i-lucide-layout-dashboard',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/kitchens/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const collection = computed(() => kitchens.value ?? [])
</script>
