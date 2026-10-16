<template>
  <div class="space-y-4">
    <UButton
      :to="venuePath"
      :label="
        presentation?.display_name
          ? `${presentation.display_name} · Venue information`
          : 'Venue information'
      "
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
    />
    <template v-if="presentation">
      <MenuCollectionScoped :index="menuIndex" browse-only>
        <template #header><UPageHeader title="Menu" /></template>
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
import { directoryMenuRouteScope } from '../../../menu/utils/menu-route'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'

definePageMeta({
  name: 'KitchenMenuIndexPage',
  title: 'Menu',
  description: 'View the published Menu.',
})

const kitchenSlug = useRouteParam('slug')
const venuePath = computed(
  () => `/kitchens/${encodeURIComponent(kitchenSlug.value)}`
)
const menuIndex = useMenuDirectory({
  routeScope: computed(() => directoryMenuRouteScope(kitchenSlug.value)),
})
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
  description: 'View the published Menu.',
  robots: () =>
    statusCode.value || menuIndex.error.value ? 'noindex, nofollow' : undefined,
})
</script>
