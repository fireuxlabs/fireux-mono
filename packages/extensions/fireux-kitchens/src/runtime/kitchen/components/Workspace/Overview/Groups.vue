<template>
  <nav
    aria-label="Kitchen working areas"
    class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
  >
    <UPageCard
      v-for="area in areas"
      :key="area.key"
      :title="area.label"
      :description="area.description"
      :icon="area.icon"
      :to="area.to"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'

const navigation = useNav(['workspace'])
const areas = computed(() =>
  navigation.items.value
    .filter(
      (item) =>
        item.desktop &&
        item.position === 'top' &&
        item.to.startsWith('/workspace/kitchen/') &&
        item.key !== 'workspace-kitchen-overview'
    )
    .sort((a, b) => a.order - b.order)
)
</script>
