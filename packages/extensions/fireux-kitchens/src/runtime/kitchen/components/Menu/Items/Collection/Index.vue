<template>
  <section :aria-label="catalogue.title" class="dish-catalogue">
    <KitchenMenuItemsCollectionControls @create="dialogs?.openCreate($event)">
      <template #intro>
        <KitchenMenuItemsAI v-if="['ready', 'empty'].includes(outcome)" />
      </template>
    </KitchenMenuItemsCollectionControls>
    <KitchenMenuItemsCollectionResults @create="dialogs?.openCreate($event)" />
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
import { useKitchenDishesContext } from '../../../../composables/workspace/dishes/useKitchenDishesContext'
import { provideDishCatalogue } from '../../../../composables/workspace/dishes/useDishCatalogue'

const { catalogue, dishes, debug, outcome } = useKitchenDishesContext()
provideDishCatalogue()
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
</style>
