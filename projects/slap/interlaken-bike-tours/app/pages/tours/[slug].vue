<script setup lang="ts">
definePageMeta({ layout: 'tours' })
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { tours } from '~/content/tours'
import { searchPage } from '~/ignition/search'
import {
  useSeo,
  buildPublicPageJsonLd,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
const route = useRoute()
const slug = useRouteParam('slug')
const tour = computed(() => tours.find((item) => item.slug === slug.value))
if (!tour.value)
  throw createError({ statusCode: 404, statusMessage: 'Tour not found' })
useSeo({
  title: () =>
    tour.value
      ? searchPage(`/tours/${tour.value.slug}`).title
      : 'Tour not found',
  description: () =>
    tour.value
      ? searchPage(`/tours/${tour.value.slug}`).description
      : undefined,
  path: () => (tour.value ? `/tours/${tour.value.slug}` : route.path),
  image: () => tour.value?.image,
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      title: context.title,
      description: context.description,
      image: context.image,
    }),
})
</script>
<template>
  <ToursDetail v-if="tour" :tour="tour" />
</template>
