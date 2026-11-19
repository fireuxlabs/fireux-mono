<template>
  <section :aria-label="catalogue.title" class="dish-catalogue">
    <KitchenMenuItemsCollectionControls @create="dialogs?.openCreate($event)" />
    <KitchenMenuItemsCollectionResults @create="dialogs?.openCreate($event)" />
    <details class="dish-catalogue__ai">
      <summary>Ask KitchenAI about your items</summary>
      <WorkspaceKitchenAIFocus
        focus="kitchen-ai.menu.items"
        label="Items"
        context-label="Menu"
      />
    </details>
    <KitchenMenuItemsCollectionDialogs ref="dialogs" />
    <FireDiagnosticsDebugPanel
      object-origin="fetched"
      launcher
      include-route
      :title="`Kitchen ${catalogue.plural}`"
      :objects="{ dishes }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenItemsContext } from '../../../../composables/workspace/items/useKitchenItemsContext'
import { provideItemCatalogue } from '../../../../composables/workspace/items/useItemCatalogue'

const { catalogue, dishes, debug } = useKitchenItemsContext()
provideItemCatalogue()
const dialogs = ref<{
  openCreate: (kind: 'food' | 'drink') => void
} | null>(null)
</script>

<style scoped>
.dish-catalogue {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}
.dish-catalogue__ai {
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
.dish-catalogue__ai summary {
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}
.dish-catalogue__ai[open] summary {
  margin-bottom: calc(var(--spacing) * 3);
}
</style>
