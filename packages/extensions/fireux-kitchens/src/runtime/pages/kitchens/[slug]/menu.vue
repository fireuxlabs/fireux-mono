<template>
  <div class="space-y-4">
    <template v-if="presentation">
      <MenuCollectionScoped :index="menuIndex" browse-only>
        <template #header>
          <KitchenDetailMenuHeader
            :venue="presentation"
            :venue-path="venuePath"
          />
          <nav
            v-if="hasCollection || hasDelivery"
            aria-label="Menu service"
            class="mt-5 flex flex-wrap gap-2"
          >
            <UButton
              label="All menus"
              :to="menuRouteIndexPath(menuIndex.routeScope.value)"
              color="neutral"
              variant="solid"
              aria-current="page"
            />
            <UButton
              v-if="hasCollection"
              label="Collection"
              :to="menuRouteIndexPath(menuIndex.routeScope.value, 'collection')"
              color="neutral"
              variant="outline"
              icon="i-lucide-shopping-bag"
            />
            <UButton
              v-if="hasDelivery"
              label="Delivery"
              :to="menuRouteIndexPath(menuIndex.routeScope.value, 'delivery')"
              color="neutral"
              variant="outline"
              icon="i-lucide-truck"
            />
          </nav>
        </template>
      </MenuCollectionScoped>
    </template>
    <KitchenDetailState
      v-else
      :outcome="outcome"
      :has-kitchen="Boolean(kitchen)"
      @refresh="refresh()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setResponseStatus, useHead, useSeoMeta } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
} from '../../../menu/utils/menu-route'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenuIndexPage',
  title: 'Menu',
})

const kitchenSlug = useRouteParam('slug')
const venuePath = computed(
  () => `/kitchens/${encodeURIComponent(kitchenSlug.value)}`
)
const menuIndex = useMenuDirectory({
  routeScope: computed(() => directoryMenuRouteScope(kitchenSlug.value)),
})
const collectionIndex = useMenuDirectory({
  routeScope: menuIndex.routeScope,
  service: 'collection',
  pageSize: 1,
})
const deliveryIndex = useMenuDirectory({
  routeScope: menuIndex.routeScope,
  service: 'delivery',
  pageSize: 1,
})
const hasCollection = computed(
  () => !collectionIndex.error.value && collectionIndex.count.value > 0
)
const hasDelivery = computed(
  () => !deliveryIndex.error.value && deliveryIndex.count.value > 0
)
const { kitchen, presentation, outcome, refresh, statusCode, ready } =
  useKitchenDetail(kitchenSlug)
await Promise.all([
  menuIndex.ready,
  collectionIndex.ready,
  deliveryIndex.ready,
  ready,
])
if (import.meta.server && (statusCode.value || menuIndex.statusCode.value)) {
  setResponseStatus(statusCode.value || menuIndex.statusCode.value || 500)
}
useHead({
  title: () => `${presentation.value?.display_name || 'Restaurant'} | Menu`,
})
useSeoMeta({
  description: () => presentation.value?.tagline || undefined,
  robots: () =>
    statusCode.value || menuIndex.error.value ? 'noindex, nofollow' : undefined,
})
</script>
