<template>
  <UPage>
    <PropertyHero />
    <UPageBody>
      <FireState v-bind="page.state" />
      <PropertyCollection
        v-show="page.state.outcome === 'ready' || page.properties.length > 0"
        :properties="page.properties"
      />
      <FireCollectionPagination
        v-if="page.pagination"
        v-bind="page.pagination"
        @load-more="page.loadMore"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePropertyCollectionPage } from '../../property/composables/usePropertyCollectionPage'

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
  description: 'Browse published properties available through this app.',
})

const page = usePropertyCollectionPage()
</script>
