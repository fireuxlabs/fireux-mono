<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-house"
    secondary-label="Property tools"
  >
    <PropertyCollectionManager />

    <template #secondary>
      <PropertyCTA />
    </template>
  </CollectionPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  tag: 'properties',
  nav: {
    key: 'properties',
    label: 'Properties',
    icon: 'i-lucide-building',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    // TODO: confirm whether app visibility hides nav only or route access,
    // and whether portfolios needs the same app gate.
    visibility: {
      apps: ['buenohost'],
    },
  },
  layout: 'default',
  name: 'PropertiesIndexPage',
  title: 'Properties',
  description:
    'Find and join properties, or create your own Property Workspace.',
})

const pageTitle = 'Properties'
const pageDescription = 'Browse properties available through this app.'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
