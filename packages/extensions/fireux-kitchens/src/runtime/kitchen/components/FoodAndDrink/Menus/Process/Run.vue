<template>
  <p v-if="!process.source" class="fx-type-caption">
    Upload the source document before processing.
  </p>
  <p v-else-if="!process.hasDraft" class="fx-type-caption">
    {{ process.sourceDescription }}
  </p>
  <FireDisclosurePanel
    v-if="process.source"
    :title="process.hasDraft ? 'Process again' : 'Process source'"
    :default-open="!process.hasDraft"
  >
    <div class="workspace-surface workspace-surface--compact">
      <KitchenFoodAndDrinkMenusProcessCost
        :source="process.source"
        :menu-id="process.menuId"
        :kitchen-id="process.kitchenId"
        :app-id="process.activeKitchenAppId"
        :can-write="process.canWrite"
        :can-process="process.canProcess"
        :pending-mode="process.pendingMode"
        @select="process.processSource"
      />
      <p v-if="process.statusMessage" class="fx-type-caption">
        {{ process.statusMessage }}
      </p>
      <FireCopyError
        v-if="process.displayError"
        :message="process.displayError"
      />
    </div>
  </FireDisclosurePanel>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/menu/useMenuSourceProcess'
defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
</script>
