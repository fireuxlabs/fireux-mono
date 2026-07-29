<template>
  <div class="kitchen-detail-route">
    <KitchenCollectionUnavailable
      v-if="isCollectionRecovery"
      :kitchen-slug="routeLocator"
    />
    <KitchenDetail
      v-else
      :kitchen="kitchen"
      :outcome="outcome"
      @refresh="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { setResponseStatus, useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenDetail } from '../../../composables/fireux/kitchen/useKitchenDetail'
import { useKitchenSeo } from '../../../composables/fireux/firestore/kitchen/utils/useKitchenSeo'
import type { Kitchen } from '../../../models/kitchen.model'

definePageMeta({
  layout: 'default',
  middleware: 'menu-projection-layout',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  name: 'KitchensDetailPage',
})

const rawRouteLocator = useRouteParam('slug')
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
const {
  kitchen,
  ready,
  refresh,
  outcome,
  missing,
  failed,
  statusCode,
} = useKitchenDetail(computed(() =>
  isCollectionRecovery.value ? '' : routeLocator.value
))

if (isCollectionRecovery.value) {
  if (import.meta.server) setResponseStatus(404)
} else {
  await ready
  if (import.meta.server && missing.value) {
    setResponseStatus(404)
  } else if (import.meta.server && failed.value) {
    setResponseStatus(statusCode.value || 503)
  }
}

useKitchenSeo(computed(() => kitchen.value as Partial<Kitchen> | null))
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
