<template>
  <section class="workspace-surface">
    <KitchenMenuServicesStatus />
    <div v-if="retained" :key="source.editorOwnerKey.value">
      <KitchenMenuServicesTitle
        :kitchen-id="source.kitchenId.value"
        :title="retained.kitchen.services?.title || 'Food & drinks'"
        :disabled="!source.canWrite.value"
      />
      <KitchenMenuServicesService
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
import { provideKitchenServicesContext } from '../../../composables/offerings/useKitchenServicesContext'
const { source, retained, snapshot, options } = provideKitchenServicesContext()
</script>
