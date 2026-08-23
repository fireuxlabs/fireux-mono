<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Kitchen dual-source outcome contract. -->
<!-- Concurrent edit — 2026-07-21 21:23 CEST — Workspace index parity: restore the shared selected-target clear contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceKitchenIndexSelected
      :kitchen="selection.kitchen"
      :kitchen-id="selection.kitchenId"
      :source="selection.kitchenSource"
      :outcome="selection.outcome"
      @clear="actions.clear"
    />

    <WorkspaceKitchenIndexTargets
      v-if="showOnboardingTargets"
      mode="free"
      :collection="sections.targets.collection"
      :demo-collection="sections.demoTargets.collection"
      :outcome="sections.targets.outcome"
      :demo-outcome="sections.demoTargets.outcome"
      :selected-id="selection.kitchenId"
      :selected-source="selection.kitchenSource"
      @select="actions.selectTarget"
    />

    <DevDebugPanel
      v-if="isDevelopment && props.showDebug"
      title="Kitchen workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedKitchen: selection.kitchen,
        kitchens: sections.targets.collection,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = withDefaults(
  defineProps<{
    showDebug?: boolean
  }>(),
  {
    showDebug: true,
  }
)
const isDevelopment = import.meta.dev
const { selection, sections, actions, debug } = useKitchenWorkspaceIndex()
const showOnboardingTargets = computed(
  () =>
    !selection.value.hasSelection &&
    sections.value.targets.show &&
    (sections.value.targets.outcome !== 'empty' ||
      sections.value.demoTargets.show)
)
</script>
