<template>
  <div class="kitchen-detail-route">
    <KitchenCollectionUnavailable
      v-if="isCollectionRecovery"
      :kitchen-slug="routeLocator"
    />
    <KitchenDetail
      v-else-if="kitchen && place && presentation"
      :kitchen="kitchen"
      :place="place"
      :presentation="presentation"
      :fulfilment="fulfilment"
      :can-edit-place="canEditPlace"
    />
  </div>
</template>

<script setup lang="ts">
import { useFetch, useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'
import { useKitchenSeo } from '../../../kitchen/composables/useKitchenSeo'
import type { KitchenFulfilment } from '../../../kitchen/models/fulfilment.model'

definePageMeta({
  layout: false,
  middleware: 'menu-projection-layout',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  name: 'KitchensDetailPage',
})

const rawRouteLocator = useRouteParam('slug')
const collectionSuffix = '.collection'
const isCollectionRecovery = computed(
  () =>
    rawRouteLocator.value.endsWith(collectionSuffix) &&
    rawRouteLocator.value.length > collectionSuffix.length
)
const routeLocator = computed(() =>
  isCollectionRecovery.value
    ? rawRouteLocator.value.slice(0, -collectionSuffix.length)
    : rawRouteLocator.value
)
const recoveryDescription =
  'This kitchen is not accepting collection orders here right now.'
const { kitchen, place, presentation, ready } = useKitchenDetail(
  computed(() => (isCollectionRecovery.value ? '' : routeLocator.value))
)

if (!isCollectionRecovery.value) {
  await ready
}

const emptyFulfilment: KitchenFulfilment = {
  delivery_zones: [],
  payment_methods: [],
}
const fulfilmentPath = computed(() =>
  presentation.value?.slug
    ? `/api/kitchens/${encodeURIComponent(presentation.value.slug)}/fulfilment`
    : ''
)
const { data: fulfilmentData } = useFetch<KitchenFulfilment>(fulfilmentPath, {
  immediate: Boolean(fulfilmentPath.value),
  watch: [fulfilmentPath],
})
const fulfilment = computed(() => fulfilmentData.value || emptyFulfilment)
const { isAdmin, isDeveloper } = useUser()
const canEditPlace = computed(() => Boolean(isAdmin.value || isDeveloper.value))

useKitchenSeo(presentation)
useSeoMeta({
  title: () =>
    isCollectionRecovery.value ? 'Collection unavailable' : undefined,
  description: () =>
    isCollectionRecovery.value ? recoveryDescription : undefined,
  robots: () => (isCollectionRecovery.value ? 'noindex, nofollow' : undefined),
})
</script>
