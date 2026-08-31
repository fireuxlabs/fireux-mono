<template>
  <UPage>
    <UPageBody>
      <KitchenHero />
      <KitchenCreate />
      <KitchenCollection :kitchens="kitchens" />
      <DevDebugPanel
        title="Kitchens index acquisition"
        context="Canonical Kitchens passed into the FL index surface."
        object-origin="fetched"
        :objects="{ kitchens }"
        :derived="{ count: kitchens.length }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenCollection } from '../../kitchen/composables/firestore/fetch/useKitchenCollection'

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

const pageTitle = 'Kitchens'
const { appName } = useFireUXConfig()
const { collection: kitchens } = useKitchenCollection()
useSeo({
  title: `${appName} | ${pageTitle}`,
  description:
    'Browse the Misebox Kitchen directory to discover restaurant profiles, current Menus and available ways to order.',
  path: '/kitchens',
})
</script>
