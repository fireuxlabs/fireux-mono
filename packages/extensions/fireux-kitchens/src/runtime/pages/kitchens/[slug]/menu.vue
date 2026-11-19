<template>
  <div>
    <template v-if="presentation">
      <MenuCollectionScoped :index="menuIndex" browse-only>
        <template #header>
          <div class="venue-menu-intro">
            <PublicKitchenDetailMenuHeader
              :venue="presentation"
              :venue-path="venuePath"
              :title="offeringName || 'Food & drinks'"
              prominent
            />
            <PublicKitchenDetailMenuServices
              v-if="!offeringId"
              :kitchen-slug="kitchenSlug"
            />
            <div class="venue-menu-intro__browse">
              <h2>Explore the menus</h2>
              <UButton
                to="/kitchens/"
                label="Explore other menus"
                trailing-icon="i-lucide-arrow-right"
                variant="link"
                color="neutral"
                size="sm"
              />
            </div>
          </div>
        </template>
      </MenuCollectionScoped>
    </template>
    <PublicKitchenDetailState
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
import { directoryMenuRouteScope } from '../../../menu/utils/navigation/route'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenuIndexPage',
  title: 'Menu',
})

const kitchenSlug = useRouteParam('slug')
const route = useRoute()
const offeringId = computed(() =>
  typeof route.query.offering === 'string' ? route.query.offering : ''
)
const venuePath = computed(
  () => `/kitchens/${encodeURIComponent(kitchenSlug.value)}`
)
const menuIndex = useMenuDirectory({
  offering: offeringId,
  routeScope: computed(() => directoryMenuRouteScope(kitchenSlug.value)),
})
const offeringName = computed(
  () =>
    menuIndex.collection.value
      .flatMap((menu) => menu.offerings || [])
      .find((offering) => offering.id === offeringId.value)?.name
)
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
<style scoped>
.venue-menu-intro {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.venue-menu-intro__browse {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.venue-menu-intro__browse h2 {
  font-size: var(--text-xl);
  font-weight: 600;
}
</style>
