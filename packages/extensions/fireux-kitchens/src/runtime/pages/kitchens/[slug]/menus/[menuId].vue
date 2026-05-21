<template>
  <div class="contents">
    <div v-if="pending" class="mx-auto max-w-3xl px-4 py-8 text-sm text-dimmed">
      Loading menu...
    </div>

    <UAlert
      v-if="showUnavailable"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <OrganismsMenuPublic
      v-if="showMenu"
      :kitchen-name="kitchenName"
      :menu="menu"
      :section-rows="sectionRows"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { usePublicKitchenMenu } from '../../../../composables/fireux/app/usePublicKitchenMenu'
import OrganismsMenuPublic from '../../../../components/organisms/Menu/Public.vue'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
  key: (route) => route.fullPath,
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())
const menuId = computed(() => String(route.params.menuId || '').trim())
const {
  kitchen,
  menu,
  sectionRows,
  pending,
  unavailable,
  canonicalSlug,
  routeMatchesKitchenId,
} = usePublicKitchenMenu(slug, menuId)

const kitchenName = computed(
  () => kitchen.value?.name || (kitchen.value as any)?.display_name || kitchen.value?.id || 'Kitchen'
)
const showUnavailable = computed(
  () => !pending.value && (unavailable.value || !menu.value || !kitchen.value)
)
const showMenu = computed(
  () => !pending.value && !showUnavailable.value && Boolean(menu.value && kitchen.value)
)

watchEffect(() => {
  if (!routeMatchesKitchenId.value || !canonicalSlug.value) return

  navigateTo(
    {
      path: `/kitchens/${encodeURIComponent(canonicalSlug.value)}/menus/${encodeURIComponent(menuId.value)}`,
      query: route.query,
    },
    { replace: true }
  )
})
</script>
