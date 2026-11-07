<template>
  <nav
    v-if="choices.length"
    aria-label="Choose collection or delivery"
    class="fx-card__actions"
  >
    <UButton
      v-for="choice in choices"
      :key="choice.service"
      :to="choice.to"
      :label="choice.label"
      :icon="choice.icon"
      :trailing-icon="!active ? 'i-lucide-arrow-right' : undefined"
      :color="active === choice.service ? 'primary' : 'neutral'"
      :variant="active === choice.service ? 'solid' : 'soft'"
      :aria-current="active === choice.service ? 'page' : undefined"
    />
  </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
} from '../../../menu/utils/navigation/route'
const props = defineProps<{
  kitchenSlug: string
  active?: 'collection' | 'delivery'
}>()
const scope = computed(() => directoryMenuRouteScope(props.kitchenSlug))
const collection = useMenuDirectory({
  routeScope: scope,
  service: 'collection',
  pageSize: 1,
})
const delivery = useMenuDirectory({
  routeScope: scope,
  service: 'delivery',
  pageSize: 1,
})
const choices = computed(() =>
  [
    {
      service: 'collection' as const,
      label: 'Collection',
      icon: 'i-lucide-shopping-bag',
      index: collection,
    },
    {
      service: 'delivery' as const,
      label: 'Delivery',
      icon: 'i-lucide-truck',
      index: delivery,
    },
  ]
    .filter(
      (choice) =>
        props.active === choice.service ||
        (!choice.index.pending.value &&
          !choice.index.error.value &&
          choice.index.count.value > 0)
    )
    .map((choice) => ({
      ...choice,
      to: menuRouteIndexPath(scope.value, choice.service),
    }))
)
await Promise.all([collection.ready, delivery.ready])
</script>
