<template>
  <section class="mx-auto grid w-full max-w-6xl min-w-0 gap-4">
    <WorkspaceKitchenMenusDetailHeader />
    <UAlert
      v-if="outcome === 'denied'"
      color="warning"
      title="Menu access unavailable"
      description="Sign in with access to this Kitchen to open its menus."
    />
    <MoleculesCopyError v-else-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading Menu…</p>
    <UAlert
      v-else-if="outcome === 'idle'"
      color="neutral"
      title="Select a Kitchen"
    />
    <UAlert
      v-else-if="!menu"
      color="neutral"
      :title="selectedKitchen ? 'Menu not found' : 'Kitchen not found'"
    />
    <div v-else :key="`${recordScope}/${menu.id}`" :aria-label="viewLabel">
      <UAlert
        v-if="!canWrite"
        color="neutral"
        :title="
          menu.schedule === 'daily' &&
          !['premium', 'business'].includes(subscription)
            ? 'Daily specials require Plus'
            : 'Read-only Menu'
        "
        class="mb-4"
      />
      <WorkspaceKitchenMenusDetailSettings v-if="view === 'details'" />
      <section v-else-if="view === 'content'" class="workspace-surface">
        <WorkspaceKitchenMenusDetailDocument
          v-if="menu.format === 'document' || menu.doc?.url"
        />
        <WorkspaceKitchenMenusSectionsCollection v-else />
      </section>
      <WorkspaceKitchenMenusPublication v-else-if="view === 'publishing'" />
      <WorkspaceKitchenMenusDetailSource v-else />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuRecordNavigation } from '../../../../composables/workspace/menus/useMenuRecordNavigation'
import { provideMenuRecordView } from '../../../../composables/workspace/menus/useMenuRecordView'
const {
  menu,
  menuSlug,
  pending,
  error,
  outcome,
  canWrite,
  subscription,
  selectedKitchen,
} = provideKitchenMenuRecordContext()
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
      details: 'Settings',
      content:
        menu.value?.schedule === 'daily'
          ? 'Dates & selections'
          : menu.value?.format === 'document' || menu.value?.doc?.url
            ? 'Document'
            : 'Items & prices',
      publishing: 'Publishing',
      source: 'Import & source',
    })[view.value]
)
</script>
