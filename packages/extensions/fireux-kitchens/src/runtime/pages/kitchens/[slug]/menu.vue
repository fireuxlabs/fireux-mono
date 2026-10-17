<template>
  <div class="space-y-4">
    <template v-if="presentation">
      <MenuCollectionScoped :index="menuIndex" browse-only>
        <template #header>
          <KitchenDetailMenuHeader
            :venue="presentation"
            :venue-path="venuePath"
            :title="offeringName || 'Food & drinks'"
          />
          <KitchenDetailMenuServices v-if="!offeringId" :kitchen-slug="kitchenSlug" class="mt-6" />
          <div class="mt-10 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold tracking-tight">
              Explore the menus
            </h2>
            <UButton
              to="/kitchens/"
              label="Explore other menus"
              trailing-icon="i-lucide-arrow-right"
              variant="link"
              color="neutral"
              size="sm"
            />
          </div>
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
import { setResponseStatus, useHead, useSeoMeta, useRoute } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { directoryMenuRouteScope } from '../../../menu/utils/menu-route'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenuIndexPage',
  title: 'Menu',
})

const kitchenSlug = useRouteParam('slug')
const route = useRoute()
const offeringId = computed(() => typeof route.query.offering === 'string' ? route.query.offering : '')
const venuePath = computed(
  () => `/kitchens/${encodeURIComponent(kitchenSlug.value)}`
)
const menuIndex = useMenuDirectory({
  offering: offeringId,
  routeScope: computed(() => directoryMenuRouteScope(kitchenSlug.value)),
})
const offeringName = computed(() => menuIndex.collection.value.flatMap(menu => menu.offerings || []).find(offering => offering.id === offeringId.value)?.name)
const { kitchen, presentation, outcome, refresh, statusCode, ready } =
  useKitchenDetail(kitchenSlug)
await Promise.all([menuIndex.ready, ready])
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
