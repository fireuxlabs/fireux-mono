<template><ToursDetail v-if="page" :page="page" /></template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { tourPages } from '~/content/tour-pages'
import { buildTourJsonLd } from '~/utils/tour-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light', validate: route => { const slug = 'slug' in route.params ? route.params.slug : undefined; return tourPages.some(page => page.slug === slug) } })
const slug = useRouteParam('slug')
const page = computed(() => tourPages.find(page => page.slug === slug.value))
useSeo({
  title: () => page.value?.title ?? 'Tour not found', description: () => page.value?.description,
  path: () => page.value?.path, image: '/img/landing/ascent-poster.webp', imageWidth: 864, imageHeight: 1536,
  jsonLdBuilder: context => page.value ? buildTourJsonLd(context, page.value) : null,
})
</script>
