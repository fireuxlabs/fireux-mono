<template>
  <DirectorySurface
    eyebrow="Discover"
    :title="pageTitle"
    description="Explore kitchens, discover their menus, and find what they are serving."
    icon="i-lucide-chef-hat"
    secondary-label="For kitchen teams"
  >
    <KitchenCollectionManager />

    <template #secondary>
      <!-- Console CTA family remains the secondary operator doorway. -->
      <KitchenCTA />
    </template>
  </DirectorySurface>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

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
useHead({ title: `${appName} | ${pageTitle}` })
</script>
