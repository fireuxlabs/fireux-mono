<template>
  <section class="workspace-surface">
    <KitchenFoodAndDrinkServicesStatus />
    <div v-if="retained" :key="source.editorOwnerKey.value">
      <KitchenFoodAndDrinkServicesTitle
        :kitchen-id="source.kitchenId.value"
        :title="retained.kitchen.services?.title || 'Food & drinks'"
        :disabled="!source.canWrite.value"
      />
      <KitchenFoodAndDrinkServicesService
        v-for="option in options"
        :key="option.key"
        :option="option"
      />
    </div>
    <DiagnosticsDebugPanel
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
