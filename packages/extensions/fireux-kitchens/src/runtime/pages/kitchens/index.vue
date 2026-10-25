<template>
  <UPage>
    <KitchenHero />
    <UPageBody>
      <KitchenCreate />
      <FireState v-bind="page.state" />
      <KitchenCollection
        v-show="page.state.outcome === 'ready'"
        :kitchens="page.kitchens"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useKitchenCollectionPage } from '../../kitchen/composables/useKitchenCollectionPage'

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
  layout: 'default',
  name: 'KitchensIndexPage',
  title: 'Kitchens',
  description:
    'Explore kitchens, discover their menus, and see what they are serving.',
})

const page = useKitchenCollectionPage()
</script>
