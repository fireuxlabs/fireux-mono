<template>
  <section class="workspace-surface" aria-label="Menu preparation">
    <FireState :outcome="outcome" entity="Menu source" :error="error" />
    <template v-if="outcome === 'ready'">
      <FireState
        v-if="context.source.value?.menu_id && !context.menu.value"
        :outcome="menuOutcome"
        entity="Prepared Menu"
        :error="error"
      />
      <KitchenMenuMenusPreparationDocument
        v-if="
          !context.source.value?.menu_id ||
          context.menu.value?.format === 'document'
        "
        :context="context"
      />
      <KitchenMenuMenusProcess
        v-if="
          !context.source.value?.menu_id ||
          context.menu.value?.format === 'interactive'
        "
        :key="`${kitchenId}/${sourceId}`"
        :context="context"
      />
      <FireDisclosurePanel title="Original source" :default-open="false">
        <KitchenMenuMenusUploadsDetailFile
          v-if="context.source.value"
          :kitchen-id="kitchenId"
          :source-id="sourceId"
          :source="context.source.value"
          :read-available="outcome === 'ready'"
        />
      </FireDisclosurePanel>
    </template>
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuPreparation } from '../../../composables/menu/useKitchenMenuPreparation'
const props = defineProps<{ kitchenId: string; sourceId: string }>()
const { context, outcome, menuOutcome, error } = useKitchenMenuPreparation({
  kitchenId: () => props.kitchenId,
  sourceId: () => props.sourceId,
})
</script>

<style src="../../../../menu/assets/styles/menu-editor.css"></style>
