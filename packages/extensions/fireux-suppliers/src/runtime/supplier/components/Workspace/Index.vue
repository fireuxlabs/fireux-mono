<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Supplier target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceSupplierIndexSelected
      :supplier="supplier"
      :supplier-id="supplierId"
      @clear="clearSupplier"
    />

    <WorkspaceSupplierIndexTargets
      :collection="suppliers"
      :outcome="outcome"
      @select="selectSupplier"
    />

    <DevDebugPanel
      title="Supplier workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedSupplier: supplier,
        suppliers,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useSupplierWorkspaceIndex } from '../../composables/workspace/index/useSupplierWorkspaceIndex'

const {
  supplier,
  supplierId,
  suppliers,
  outcome,
  selectSupplier,
  clearSupplier,
  debug,
} = useSupplierWorkspaceIndex()
</script>
