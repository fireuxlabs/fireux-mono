<template>
  <div
    class="workspace-surface__grid"
    :class="{ 'workspace-surface__grid--2': process.currentSections.length }"
  >
    <FireDisclosurePanel
      v-if="process.currentSections.length"
      title="Existing menu"
    >
      <div class="workspace-surface workspace-surface--compact">
        <KitchenFoodAndDrinkMenusProcessSections
          :sections="process.currentSections"
          empty-label="No existing sections found."
        />
      </div>
    </FireDisclosurePanel>
    <FireDisclosurePanel title="Menu items" :default-open="true">
      <div class="workspace-surface workspace-surface--compact">
        <KitchenFoodAndDrinkMenusProcessSections
          :sections="process.draftSections"
          empty-label="No draft sections returned."
        />
      </div>
    </FireDisclosurePanel>
  </div>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/menu/useMenuSourceProcess'
defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
</script>
