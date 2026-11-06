<template>
  <DestinationsDetail v-if="destination" :destination="destination" />
</template>
<script setup lang="ts">
import {
  useSeo,
  buildPublicPageJsonLd,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { searchPage } from '~/ignition/search'
import { destinations } from '~/content/destinations'
definePageMeta({ layout: 'default' })
const route = useRoute()
const destination = computed(() =>
  destinations.find(
    (item) =>
      item.slug === ('slug' in route.params ? route.params.slug : undefined)
  )
)
if (!destination.value)
  throw createError({ statusCode: 404, statusMessage: 'Destination not found' })
useSeo({
  title: () =>
    destination.value
      ? searchPage(`/destinations/${destination.value.slug}`).title
      : 'Destination not found',
  description: () => destination.value?.summary,
  path: () =>
    destination.value ? `/destinations/${destination.value.slug}` : route.path,
  image: '/img/app/thumbnail.png',
  jsonLdBuilder: (context) => buildPublicPageJsonLd(context),
})
</script>
