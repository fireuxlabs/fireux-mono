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
    <div v-else :key="`${recordScope}/${menu.id}`" class="workspace-surface">
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
      <section :key="view" :aria-label="viewLabel" class="menu-record-panel">
        <KitchenMenuMenusDetailSettings v-if="view === 'details'" />
        <template v-else-if="view === 'content'">
          <KitchenMenuMenusDetailDocument
            v-if="menu.format === 'document' || menu.doc?.url"
          />
          <KitchenMenuMenusSectionsCollection v-else />
        </template>
        <KitchenMenuMenusPublication v-else-if="view === 'publishing'" />
        <KitchenMenuMenusDetailSource v-else />
      </section>
      <details class="kitchen-record-assistant">
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
@import '../../../Workspace/record-tools.css';

.menu-record-panel {
  min-width: 0;
  min-block-size: min(16rem, 38vh);
}

@media (prefers-reduced-motion: no-preference) {
  .menu-record-panel {
    animation: menu-panel-enter 140ms ease-out;
  }
}

@keyframes menu-panel-enter {
  from {
    opacity: 0.65;
  }
  to {
    opacity: 1;
  }
}
</style>
