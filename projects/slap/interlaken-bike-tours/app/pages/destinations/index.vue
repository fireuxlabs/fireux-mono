<template>
  <UPage>
    <UPageHeader
      title="Cycling destinations"
      description="Explore destinations on our existing rides, or ask about a custom trip in Bern or Lausanne. Custom routes and availability are confirmed directly with your guide."
    />
    <UPageBody><DestinationsCollection /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import {
  useSeo,
  buildPublicPageJsonLd,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { searchPage } from '~/ignition/search'
definePageMeta({
  layout: 'default',
  nav: {
    key: 'cycling-destinations',
    label: 'Destinations',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
const page = searchPage('/destinations')
useSeo({
  title: page.title,
  description: page.description,
  path: page.path,
  image: '/img/app/thumbnail.png',
  jsonLdBuilder: (context) => buildPublicPageJsonLd(context),
})
</script>
