<template>
  <KitchenCollectionUnavailable
    v-if="isCollectionRecovery"
    :kitchen-slug="routeLocator"
  />
  <KitchenDetail v-else :locator="routeLocator" />
</template>

<script setup lang="ts">
import { setResponseStatus, useRoute, useSeoMeta } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'menu-projection-layout',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  name: 'KitchensDetailPage',
})

const route = useRoute()
const rawRouteLocator = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
const collectionSuffix = '.collection'
const isCollectionRecovery = computed(() =>
  rawRouteLocator.value.endsWith(collectionSuffix) &&
  rawRouteLocator.value.length > collectionSuffix.length
)
const routeLocator = computed(() => isCollectionRecovery.value
  ? rawRouteLocator.value.slice(0, -collectionSuffix.length)
  : rawRouteLocator.value
)
const recoveryDescription =
  'This kitchen is not accepting collection orders here right now.'

if (isCollectionRecovery.value) {
  if (import.meta.server) setResponseStatus(404)
}

useSeoMeta({
  title: () => isCollectionRecovery.value
    ? 'Collection unavailable'
    : undefined,
  description: () => isCollectionRecovery.value
    ? recoveryDescription
    : undefined,
  robots: () => isCollectionRecovery.value
    ? 'noindex, nofollow'
    : undefined,
})
</script>
