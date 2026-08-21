<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Supplier target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceSupplierIndexSelected
      :supplier="selection.supplier"
      :supplier-id="selection.supplierId"
      @clear="actions.clear"
    />

    <WorkspaceSupplierIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevDebugPanel
      title="Supplier workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedSupplier: selection.supplier,
        suppliers: sections.targets.collection,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierWorkspaceIndex } from '../../composables/workspace/index/useSupplierWorkspaceIndex'

const { selection, sections, actions, debug } = useSupplierWorkspaceIndex()
</script>
