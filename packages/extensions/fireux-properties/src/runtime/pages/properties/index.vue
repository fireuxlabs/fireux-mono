<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Browse properties available in this app."
    />

    <UPageBody>
      <PropertyCTA />

      <PropertyCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

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
  description: 'Browse properties.',
})

const pageTitle = 'Properties'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
