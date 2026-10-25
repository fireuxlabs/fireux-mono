<template>
  <div
    class="grid gap-4"
    :class="{ 'xl:grid-cols-2': process.currentSections.length }"
  >
    <FireDisclosurePanel
      v-if="process.currentSections.length"
      title="Existing menu"
    >
      <div class="mt-3 rounded-lg border border-default p-3">
        <KitchenFoodAndDrinkMenusProcessSections
          :sections="process.currentSections"
          empty-label="No existing sections found."
        />
      </div>
    </FireDisclosurePanel>
    <FireDisclosurePanel title="Menu items" :default-open="true">
      <div class="mt-3 space-y-3">
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
import type { useMenuSourceProcess } from '../../../../composables/workspace/menus/useMenuSourceProcess'
defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
</script>
