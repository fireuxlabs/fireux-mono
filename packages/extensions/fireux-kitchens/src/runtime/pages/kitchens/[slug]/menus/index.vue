<template>
  <UPage>
    <UPageBody>
      <KitchenDetail
        v-if="presentation && place"
        :presentation="presentation"
        :place="place"
        :menus="menuIndex"
      />
      <KitchenDetailState
        v-else
        :outcome="outcome"
        :has-kitchen="Boolean(kitchen)"
        @refresh="refresh()"
      />
      <DevDebugPanel
        title="Kitchen menu chooser"
        context="Existing public reader projections, not raw Firestore documents. No additional reads."
        scope="kitchen-menu-chooser"
        object-origin="fetched"
        :objects="debugObjects"
        :derived="debugDerived"
        :hide-when-empty="false"
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useHead, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../../kitchen/utils/kitchen-menu-route'
import { useKitchenDetail } from '../../../../kitchen/composables/useKitchenDetail'
import { useMenuDirectory } from '../../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenusIndexPage',
  title: 'Menus',
  description: 'Browse this kitchen’s published menus.',
})

const kitchenSlug = useRouteParam('slug')
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
const menuIndex = useMenuDirectory({ routeScope: menuRouteScope })
const {
  kitchen,
  place,
  presentation,
  outcome,
  refresh,
  statusCode,
  ready: kitchenReady,
} = useKitchenDetail(kitchenSlug)
const { appName } = useFireUXConfig()

const debugObjects = computed(() => ({
  kitchenPublicRecord: kitchen.value,
  placePublicRecord: place.value,
  publishedMenuEntries: menuIndex.collection.value,
}))
const debugDerived = computed(() => ({
  kitchenSlug: kitchenSlug.value,
  menuRouteScope: menuRouteScope.value,
  kitchenRead: { outcome: outcome.value, statusCode: statusCode.value },
  menuRead: {
    outcome: menuIndex.outcome.value,
    directoryOutcome: menuIndex.directoryOutcome.value,
    statusCode: menuIndex.statusCode.value,
    failed: Boolean(menuIndex.error.value),
    pending: menuIndex.pending.value,
    hasMore: menuIndex.hasMore.value,
    loadingMore: menuIndex.loadingMore.value,
    loadMoreFailed: Boolean(menuIndex.loadMoreError.value),
  },
  presentation: presentation.value,
  openingHours: {
    sourceAvailable: Boolean(place.value),
    hoursPresent: Boolean(place.value?.business_hours?.windows?.length),
    windowCount: place.value?.business_hours?.windows?.length ?? null,
    timezone: place.value?.timezone ?? null,
  },
  services: presentation.value?.offerings ?? null,
  menuDestinations: menuIndex.collection.value.map((menu) => ({
    id: menu.id,
    path: menuIndex.menuLink(menu.id),
    publishedServices: menu.offerings ?? null,
  })),
}))

await Promise.all([menuIndex.ready, kitchenReady])
if (import.meta.server && (statusCode.value || menuIndex.statusCode.value)) {
  setResponseStatus(statusCode.value || menuIndex.statusCode.value || 500)
}

useHead({
  title: () => `${presentation.value?.display_name || appName} | Menus`,
})
useSeoMeta({
  description: 'Browse this kitchen’s published menus.',
  robots: () =>
    statusCode.value || menuIndex.error.value ? 'noindex, nofollow' : undefined,
})
</script>
