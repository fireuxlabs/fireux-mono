<template>
  <section class="space-y-4" aria-label="Kitchen at this Place">
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-muted">Kitchen at this Place</p>
      <UButton
        :to="`/kitchens/${encodeURIComponent(kitchen.slug)}`"
        label="View Kitchen"
        trailing-icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="ghost"
      />
    </div>
    <KitchenDetailMenus :kitchen="kitchen" :index="menus" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import KitchenDetailMenus from 'fireux-kitchens/runtime/kitchen/components/Detail/Menus.vue'
import { useMenuDirectory } from 'fireux-kitchens/runtime/menu/composables/useMenuDirectory'
import { directoryMenuRouteScope } from 'fireux-kitchens/runtime/kitchen/utils/kitchen-menu-route'
const props = defineProps<{ kitchen: { id: string; slug: string } }>()
const menus = useMenuDirectory({
  routeScope: computed(() => directoryMenuRouteScope(props.kitchen.slug)),
})
await menus.ready
</script>
