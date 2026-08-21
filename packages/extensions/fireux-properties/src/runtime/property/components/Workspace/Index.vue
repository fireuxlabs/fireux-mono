<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Property target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspacePropertyIndexSelected
      :property="selection.property"
      :property-id="selection.propertyId"
      @clear="actions.clear"
    />

    <WorkspacePropertyIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevDebugPanel
      title="Property workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedProperty: selection.property,
        properties: sections.targets.collection,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyWorkspaceIndex } from '../../composables/workspace/index/usePropertyWorkspaceIndex'

const { selection, sections, actions, debug } = usePropertyWorkspaceIndex()
</script>
