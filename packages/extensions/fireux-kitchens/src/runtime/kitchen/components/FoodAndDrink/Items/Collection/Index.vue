<template>
  <section :aria-label="catalogue.title" class="dish-catalogue">
    <KitchenFoodAndDrinkItemsCollectionControls
      @create="dialogs?.openCreate($event)"
      @categories="dialogs?.openCategories()"
      @ai="dialogs?.openAI()"
    />
    <KitchenFoodAndDrinkItemsCollectionResults
      @create="dialogs?.openCreate($event)"
    />
    <KitchenFoodAndDrinkItemsCollectionDialogs ref="dialogs" />
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

const { catalogue, dishes, debug } = useKitchenDishesContext()
provideDishCatalogue()
const dialogs = ref<{
  openCreate: (kind: 'food' | 'drink') => void
  openCategories: () => void
  openAI: () => void
} | null>(null)
</script>

<style scoped>
.dish-catalogue {
  display: grid;
  min-width: 0;
  gap: 24px;
}
</style>
