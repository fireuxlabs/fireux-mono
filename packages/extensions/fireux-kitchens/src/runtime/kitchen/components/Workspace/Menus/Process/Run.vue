<template>
  <p v-if="!process.source" class="text-sm text-dimmed">
    Upload the source document before processing.
  </p>
  <p v-else-if="!process.hasDraft" class="text-sm text-dimmed">
    {{ process.sourceDescription }}
  </p>
  <MoleculesDisclosurePanel
    v-if="process.source"
    :title="process.hasDraft ? 'Process again' : 'Process source'"
    :default-open="!process.hasDraft"
  >
    <div class="mt-3 space-y-3">
      <WorkspaceKitchenMenusProcessCost
        :source="process.source"
        :menu-id="process.menuId"
        :kitchen-id="process.kitchenId"
        :app-id="process.activeKitchenAppId"
        :can-write="process.canWrite"
        :can-process="process.canProcess"
        :pending-mode="process.pendingMode"
        @select="process.processSource"
      />
      <p v-if="process.statusMessage" class="text-sm text-dimmed">
        {{ process.statusMessage }}
      </p>
      <MoleculesCopyError
        v-if="process.displayError"
        :message="process.displayError"
      />
    </div>
  </MoleculesDisclosurePanel>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/workspace/menus/useMenuSourceProcess'
defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
</script>
