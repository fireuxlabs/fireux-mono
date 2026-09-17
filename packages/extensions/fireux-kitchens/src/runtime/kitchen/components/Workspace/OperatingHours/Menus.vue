<template>
  <section class="space-y-4" aria-labelledby="operating-menu-hours">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2
          id="operating-menu-hours"
          class="text-lg font-semibold text-highlighted"
        >
          Published Menus
        </h2>
      </div>
      <UButton
        to="/workspace/kitchen/menus"
        label="Manage Menus"
        trailing-icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="link"
      />
    </header>
    <MoleculesStateCard
      v-if="outcome === 'pending' || outcome === 'idle'"
      entity="Menus"
      kind="collection"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Menus"
      kind="collection"
      state="error"
    />
    <p
      v-else-if="!panels.length"
      class="rounded-lg border border-default p-5 text-sm text-muted"
    >
      No published Menus yet.
    </p>
    <div v-else class="operating-menu-grid">
      <WorkspaceKitchenOperatingHoursMenu
        v-for="panel in panels"
        :key="panel.menu.id"
        :menu="panel.menu"
        :entries="panel.entries"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import type { menuServiceSummaries } from '../../../utils/menu-service-summary'
import type { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
defineProps<{
  panels: Array<{
    menu: KitchenMenu
    entries: ReturnType<typeof menuServiceSummaries>
  }>
  outcome: ReturnType<typeof useKitchenMenuCollection>['outcome']['value']
}>()
</script>
<style scoped>
.operating-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
  align-items: start;
  gap: 1rem;
}
.operating-menu-grid > * {
  min-width: 0;
}
</style>
