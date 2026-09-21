<template>
  <section class="mx-auto grid w-full max-w-6xl min-w-0 gap-4">
    <WorkspaceKitchenMenusWorkspaceHeader />
    <MoleculesCopyError v-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading Menu…</p>
    <UAlert v-else-if="!menu" color="neutral" title="Menu not found" />
    <div v-else :key="`${recordScope}/${menu.id}`" :aria-label="viewLabel">
      <WorkspaceKitchenMenusMenu v-if="view === 'details'" />
      <WorkspaceKitchenMenusContent v-else-if="view === 'content'" />
      <WorkspaceKitchenMenusPublishing v-else-if="view === 'publishing'" />
      <WorkspaceKitchenMenusSource v-else />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenuRecord } from '../../../composables/workspace/menus/useKitchenWorkspaceMenuRecord'
import { useMenuRecordNavigation } from '../../../composables/workspace/menus/useMenuRecordNavigation'
import { provideMenuRecordView } from '../../../composables/workspace/menus/useMenuRecordView'
const { menu, menuSlug, pending, error } = useKitchenWorkspaceMenuRecord()
const { scope, entryView, clearView } = useMenuRecordNavigation()
const recordScope = computed(() => `${scope.value}/${menuSlug.value}`)
const { view } = provideMenuRecordView(
  recordScope,
  menu,
  () => entryView(menuSlug.value),
  clearView
)
const viewLabel = computed(
  () =>
    ({
      details: 'Details',
      content: menu.value?.schedule === 'daily' ? 'Calendar' : 'Items & prices',
      publishing: 'Publishing',
      source: 'Source',
    })[view.value]
)
</script>
