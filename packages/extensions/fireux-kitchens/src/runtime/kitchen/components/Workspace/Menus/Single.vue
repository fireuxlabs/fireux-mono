<template>
  <p v-if="derived.status === 'loading'" role="status" class="fx-type-body">
    Loading Menu…
  </p>
  <p v-else-if="derived.status === 'error'" class="fx-type-body">
    The selected Menu is unavailable.
  </p>
  <template v-else>
    <WorkspaceSingleCard
      v-if="selectedMenu"
      :name="selectedMenu.name || selectedMenu.id"
      :to="selectedPath"
      :description="selectedMenu.description"
    >
      <template #avatar>
        <UAvatar
          :icon="statusIcon"
          :class="{ 'menu-status--published': status === 'published' }"
          :title="status"
          :aria-label="status"
          size="xl"
        />
      </template>
      <UBadge
        :color="
          status === 'published'
            ? 'success'
            : status === 'draft'
              ? 'warning'
              : 'neutral'
        "
        variant="subtle"
        >{{
          status === 'published'
            ? 'Published'
            : status === 'archived'
              ? 'Archived'
              : 'Draft'
        }}</UBadge
      >
      <span>{{ orderingEnabled ? 'Ordering enabled' : 'Browse only' }}</span>
    </WorkspaceSingleCard>
    <p v-else class="fx-type-caption">Choose a Menu from the collection.</p>
  </template>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const { selectedMenu, selectedOrdering, derived } = useKitchenMenusContext()
const selectedPath = computed(
  () =>
    `/workspace/kitchen/menus/${encodeURIComponent(selectedMenu.value?.slug || '')}`
)
const status = computed(() => selectedMenu.value?.status || 'draft')
const orderingEnabled = computed(
  () =>
    selectedOrdering.value.enabled === true &&
    Boolean(selectedOrdering.value.order_types?.length)
)
const statusIcon = computed(() =>
  status.value === 'published'
    ? 'i-lucide-check'
    : status.value === 'archived'
      ? 'i-lucide-archive'
      : 'i-lucide-file-pen-line'
)
</script>

<style scoped>
.menu-status--published {
  color: var(--ui-success);
  background: color-mix(in srgb, var(--ui-success) 15%, var(--ui-bg));
}
</style>
