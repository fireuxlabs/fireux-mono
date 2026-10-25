<template>
  <FireCopyError
    v-if="error"
    :message="`${section.label}: ${String(error)}`"
  />
  <p v-else-if="pending" class="text-sm text-muted">
    Loading {{ section.label }}…
  </p>
  <NuxtLink
    v-for="item in matches"
    v-else
    :key="item.id"
    :to="destination"
    class="flex items-center justify-between gap-4 border-b border-default py-3 last:border-0 hover:text-primary"
  >
    <div>
      <p class="font-medium">{{ section.label }}</p>
      <p v-if="section.date" class="text-sm text-muted">{{ section.date }}</p>
    </div>
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-arrow-up-right" />
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import { computed, watch } from 'vue'
import type { Menu } from '../../../../menu/models/menu.model'
import type { MenuSection } from '../../../../menu/models/menu-section.model'
import { useKitchenDishDetail } from '../../../composables/dish/useKitchenDishDetail'
import { useMenuSectionItemCollection } from '../../../../menu/composables/useMenuSectionItemCollection'
const props = defineProps<{ menu: Menu; section: MenuSection }>()
const emit = defineEmits<{
  result: [value: 'pending' | 'error' | 'empty' | 'match']
}>()
const { dishId, storageKitchenId, databaseId, rootCollection } =
  useKitchenDishDetail(
    () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
    useRouteParam('dishId')
  )
const { items, pending, error } = useMenuSectionItemCollection(
  storageKitchenId,
  computed(() => props.menu.id),
  computed(() => props.section.id),
  { databaseId, kitchenCollectionPath: rootCollection }
)
const matches = computed(() =>
  items.value.filter((item) => item.dish_id === dishId.value)
)
const destination = computed(
  () =>
    `/workspace/kitchen/food-and-drink/menus/${encodeURIComponent(props.menu.slug)}/${encodeURIComponent(props.section.id)}`
)
watch(
  [pending, error, matches, dishId],
  () =>
    emit(
      'result',
      error.value
        ? 'error'
        : pending.value
          ? 'pending'
          : matches.value.length
            ? 'match'
            : 'empty'
    ),
  { immediate: true }
)
</script>
