<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Property target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspacePropertyIndexActive
      :property="property"
      :property-id="propertyId"
      @clear="clearProperty"
    />

    <WorkspacePropertyIndexTargets
      :collection="properties"
      :outcome="outcome"
      @select="selectProperty"
    />

    <DevDebugPanel
      title="Property workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedProperty: property,
        properties,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { usePropertyWorkspaceIndex } from '../../composables/workspace/index/usePropertyWorkspaceIndex'

const {
  property,
  propertyId,
  properties,
  outcome,
  selectProperty,
  clearProperty,
  debug,
} = usePropertyWorkspaceIndex()
</script>
