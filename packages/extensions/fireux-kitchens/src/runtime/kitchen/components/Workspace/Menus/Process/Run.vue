<template>
  <p v-if="!process.source" class="text-sm text-dimmed">
    Upload the source document before processing.
  </p>
  <p v-else class="text-sm text-dimmed">
    {{ process.sourceDescription }}
  </p>
  <MoleculesDisclosurePanel
    v-if="process.source"
    title="Process source"
    :default-open="true"
  >
    <div class="mt-3 space-y-3">
      <WorkspaceKitchenMenusProcessCost
        :can-process="process.canProcess"
        :pending-mode="process.pendingMode"
        @select="process.processSource"
      />
      <p v-if="process.statusMessage" class="text-sm text-dimmed">
        {{ process.statusMessage }}
      </p>
      <p v-if="process.displayError" class="text-sm text-error">
        {{ process.displayError }}
      </p>
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
