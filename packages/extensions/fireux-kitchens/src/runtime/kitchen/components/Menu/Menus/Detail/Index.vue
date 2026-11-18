<template>
  <section class="workspace-surface">
    <KitchenMenuMenusDetailHeader />
    <UAlert
      v-if="outcome === 'denied'"
      color="warning"
      title="Menu access unavailable"
      description="Sign in with access to this Kitchen to open its menus."
    />
    <FireCopyError v-else-if="error" :message="String(error)" />
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
    <div
      v-else
      :key="`${recordScope}/${menu.id}`"
      class="workspace-surface"
      :aria-label="viewLabel"
    >
      <UAlert
        v-if="!canWrite"
        color="neutral"
        :title="
          menu.schedule === 'daily' &&
          !['pro', 'business'].includes(subscription)
            ? 'Daily specials require Pro'
            : 'Read-only Menu'
        "
      />
      <UAlert
        v-if="menu.status === 'archived'"
        title="Archived Menu"
        description="This Menu is no longer public. Restore it to draft in Settings when you need it again."
        color="neutral"
      />
      <KitchenMenuMenusDetailSettings v-if="view === 'details'" />
      <section v-else-if="view === 'content'" class="workspace-surface">
        <KitchenMenuMenusDetailDocument
          v-if="menu.format === 'document' || menu.doc?.url"
        />
        <KitchenMenuMenusSectionsCollection v-else />
      </section>
      <KitchenMenuMenusPublication v-else-if="view === 'publishing'" />
      <KitchenMenuMenusDetailSource v-else />
      <details class="menu-record-ai">
        <summary>Ask KitchenAI about this menu</summary>
        <WorkspaceKitchenAIFocus
          focus="kitchen-ai.menu.menus"
          label="Menu records"
          context-label="Menu"
        />
      </details>
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

<style src="../../../../../menu/assets/styles/menu-editor.css"></style>

<style scoped>
.menu-record-ai {
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
.menu-record-ai summary {
  cursor: pointer;
  color: var(--ui-text);
  font-weight: var(--font-weight-medium);
}
.menu-record-ai[open] summary {
  margin-bottom: calc(var(--spacing) * 3);
}
</style>
