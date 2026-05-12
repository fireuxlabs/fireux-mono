<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" />
    <UPageBody class="pagebody">
      <OrganismsKitchenCTA />
      <OrganismsKitchenCollectionManager
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
import { useKitchenCollection } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'

definePageMeta({
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'dashboard-kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    position: 'bottom',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  title: 'Kitchens',
  description: 'Select a kitchen console context.',
  layout: 'dashboard',
  requiresAuth: true,
  name: 'DashboardKitchensIndexPage',
})

const pageTitle = 'Kitchens'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenCollection()
const collection = computed(() => kitchens.value)
</script>
