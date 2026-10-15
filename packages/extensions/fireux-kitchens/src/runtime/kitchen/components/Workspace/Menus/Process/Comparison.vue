<template>
  <div
    class="grid gap-4"
    :class="{ 'xl:grid-cols-2': process.currentSections.length }"
  >
    <MoleculesDisclosurePanel
      v-if="process.currentSections.length"
      title="Existing menu"
    >
      <div class="mt-3 rounded-lg border border-default p-3">
        <WorkspaceKitchenMenusProcessSections
          :sections="process.currentSections"
          empty-label="No existing sections found."
        />
      </div>
    </MoleculesDisclosurePanel>
    <MoleculesDisclosurePanel title="Menu draft" :default-open="true">
      <div class="mt-3 space-y-3 rounded-lg border border-default p-3">
        <p class="text-sm text-dimmed">
          The raw read has been cleaned into reviewable menu sections.
        </p>
        <WorkspaceKitchenMenusProcessSections
          :sections="process.draftSections"
          empty-label="No draft sections returned."
        />
      </div>
    </MoleculesDisclosurePanel>
  </div>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuSourceProcess } from '../../../../composables/workspace/menus/useMenuSourceProcess'
defineProps<{
  process: UnwrapNestedRefs<ReturnType<typeof useMenuSourceProcess>>
}>()
</script>
