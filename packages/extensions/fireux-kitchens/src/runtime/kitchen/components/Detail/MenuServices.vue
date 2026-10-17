<template>
  <nav
    v-if="choices.length"
    aria-label="Choose collection or delivery"
    :class="active ? 'flex flex-wrap gap-2' : 'grid gap-3 sm:grid-cols-2'"
  >
    <NuxtLink
      v-for="choice in choices"
      :key="choice.service"
      :to="choice.to"
      :aria-current="active === choice.service ? 'page' : undefined"
      :class="
        active
          ? [
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              active === choice.service
                ? 'border-primary bg-primary text-inverted'
                : 'border-default hover:bg-elevated',
            ]
          : 'group flex items-center gap-4 rounded-2xl border border-default bg-elevated/40 p-5 transition-colors hover:border-primary hover:bg-elevated focus-visible:outline-primary'
      "
    >
      <UIcon :name="choice.icon" class="size-5 shrink-0" aria-hidden="true" />
      <span :class="active ? '' : 'flex-1 text-lg font-semibold'">{{
        choice.label
      }}</span>
      <UIcon
        v-if="!active"
        name="i-lucide-arrow-right"
        class="size-5 text-muted transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </NuxtLink>
  </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMenuDirectory } from '../../../menu/composables/useMenuDirectory'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
} from '../../../menu/utils/menu-route'
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
