<template>
  <FireCopyError v-if="error" :message="`${section.label}: ${String(error)}`" />
  <p v-else-if="pending">Loading {{ section.label }}…</p>
  <NuxtLink v-for="item in matches" v-else :key="item.id" :to="destination">
    <div>
      <p>{{ section.label }}</p>
      <p v-if="section.date">{{ section.date }}</p>
    </div>
    <div>
      <UIcon name="i-lucide-arrow-up-right" />
    </div>
  </NuxtLink>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Menu } from '../../../../menu/models/menu.model'
import type { MenuSection } from '../../../../menu/models/menu-section.model'
import { useKitchenItemDetail } from '../../../composables/dish/useKitchenItemDetailContext'
import { useMenuSectionItemCollection } from '../../../../menu/composables/useMenuSectionItemCollection'
const props = defineProps<{ menu: Menu; section: MenuSection }>()
const emit = defineEmits<{
  result: [value: 'pending' | 'error' | 'empty' | 'match']
}>()
const { dishId, storageKitchenId, databaseId, rootCollection } =
  useKitchenItemDetail()
const { items, pending, error } = useMenuSectionItemCollection(
  storageKitchenId,
  computed(() => props.menu.id),
  computed(() => props.section.id),
  { databaseId, kitchenCollectionPath: rootCollection }
)
const matches = computed(() =>
  items.value.filter((item) => item.dish_id === dishId.value)
)
const destination = computed(() =>
  props.menu.schedule === 'daily'
    ? `/workspace/kitchen/menu/menus/${encodeURIComponent(props.menu.slug)}/${encodeURIComponent(props.section.id)}`
    : `/workspace/kitchen/menu/menus/${encodeURIComponent(props.menu.slug)}?section=${encodeURIComponent(props.section.id)}`
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
