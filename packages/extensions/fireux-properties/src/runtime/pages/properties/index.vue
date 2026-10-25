<template>
  <UPage
    ><UPageBody>
      <PropertyHero />
      <PropertyCollection :properties="properties" />
      <FireCollectionPagination
        :has-more="hasMore"
        :loading="loadingMore"
        @load-more="loadMore"
      /> </UPageBody
  ></UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePropertyDirectory } from '../../property/composables/usePropertyDirectory'

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

const pageTitle = 'Properties'
const pageDescription = 'Browse properties available through this app.'
const { appName } = useFireUXConfig()
const { properties, hasMore, loadingMore, loadMore } = usePropertyDirectory()
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/properties',
})
</script>
