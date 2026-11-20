<template>
  <section class="workspace-surface">
    <WorkspaceKitchenAIFocus
      focus="kitchen-ai.menu.services"
      label="Services"
      context-label="Menu"
    />
    <WorkspaceKitchenServicesStatus />
    <div v-if="retained" :key="source.editorOwnerKey.value">
      <WorkspaceKitchenServicesService
        v-for="option in options"
        :key="option.key"
        :option="option"
      />
    </div>
    <FireDiagnosticsDebugPanel
      title="Kitchen Services"
      scope="workspace"
      object-origin="passed"
      :objects="{ services: snapshot.services }"
      :derived="snapshot.derived"
      include-route
      launcher
    />
  </section>
</template>
<script setup lang="ts">
import { provideKitchenServicesContext } from '../../../composables/workspace/services/useKitchenServicesContext'
const { source, retained, snapshot, options } = provideKitchenServicesContext()
</script>
