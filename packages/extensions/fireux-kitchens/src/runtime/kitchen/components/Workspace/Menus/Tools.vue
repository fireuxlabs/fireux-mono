<template>
  <section class="menu-tools" aria-label="Menu tools">
    <UPageGrid class="menu-tools__grid">
      <UPageCard
        title="Items & prices"
        description="Edit prices and item availability."
        icon="i-lucide-list-tree"
        variant="subtle"
        class="menu-tools__card"
        :ui="cardUi"
        :to="ready ? `${menuPath}/content` : undefined"
      >
        <p v-if="!ready" class="fx-type-caption">
          Choose a Menu to open this tool.
        </p>
      </UPageCard>
      <UPageCard
        title="Publishing"
        description="Manage visibility and open the public Menu."
        icon="i-lucide-globe"
        variant="subtle"
        class="menu-tools__card"
        :ui="cardUi"
        :to="ready ? `${menuPath}/publishing` : undefined"
      >
        <p v-if="!ready" class="fx-type-caption">
          Choose a Menu to open this tool.
        </p>
      </UPageCard>
      <UPageCard
        title="Duplicate Menu"
        description="Start another Menu from an existing one."
        icon="i-lucide-copy"
        variant="subtle"
        class="menu-tools__card"
        :ui="cardUi"
      >
        <UBadge color="neutral" variant="soft">Not available yet</UBadge>
      </UPageCard>
      <UPageCard
        title="Schedule changes"
        description="Prepare updates for a later date."
        icon="i-lucide-calendar-clock"
        variant="subtle"
        class="menu-tools__card"
        :ui="cardUi"
      >
        <UBadge color="neutral" variant="soft">Not available yet</UBadge>
      </UPageCard>
    </UPageGrid>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const cardUi = {
  container: 'menu-tools__card-content',
  leadingIcon: 'menu-tools__card-icon',
  description: 'menu-tools__card-description',
}
const { selectedMenu, derived } = useKitchenMenusContext()
const ready = computed(
  () => derived.value.status === 'ready' && Boolean(selectedMenu.value)
)
const menuPath = computed(
  () =>
    `/workspace/kitchen/menus/${encodeURIComponent(selectedMenu.value?.id || '')}`
)
</script>
<style scoped>
.menu-tools {
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding-top: calc(var(--spacing) * 4);
}
.menu-tools__grid {
  gap: calc(var(--spacing) * 3);
  grid-template-columns: minmax(0, 1fr);
}
.menu-tools__card {
  aspect-ratio: 1;
  min-height: 11rem;
}
.menu-tools__card :deep(.menu-tools__card-content) {
  height: 100%;
  justify-content: space-between;
  padding: calc(var(--spacing) * 4);
}
.menu-tools__card :deep(.menu-tools__card-icon) {
  width: calc(var(--spacing) * 7);
  height: calc(var(--spacing) * 7);
}
.menu-tools__card :deep(.menu-tools__card-description) {
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}
@media (min-width: 40rem) {
  .menu-tools__card :deep(.menu-tools__card-content) {
    padding: calc(var(--spacing) * 5);
  }
  .menu-tools__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 64rem) {
  .menu-tools__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
