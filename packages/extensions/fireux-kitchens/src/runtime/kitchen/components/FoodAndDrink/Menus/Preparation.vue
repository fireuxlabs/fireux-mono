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
      <KitchenFoodAndDrinkMenusPreparationDocument
        v-if="
          !context.source.value?.menu_id ||
          context.menu.value?.format === 'document'
        "
        :context="context"
      />
      <KitchenFoodAndDrinkMenusProcess
        v-if="
          !context.source.value?.menu_id ||
          context.menu.value?.format === 'interactive'
        "
        :key="`${kitchenId}/${sourceId}`"
        :context="context"
      />
      <FireDisclosurePanel title="Original source" :default-open="false">
        <KitchenFoodAndDrinkMenusUploadsDetailFile
          v-if="context.source.value"
          :source="context.source.value"
          :files="files"
        />
      </FireDisclosurePanel>
    </template>
  </section>
</template>
<script setup lang="ts">
import '../../../../menu/assets/styles/menu-editor.css'
import { computed } from 'vue'
import { useKitchenMenuPreparation } from '../../../composables/menu/useKitchenMenuPreparation'
const props = defineProps<{ kitchenId: string; sourceId: string }>()
const { context, outcome, menuOutcome, error } = useKitchenMenuPreparation({
  kitchenId: () => props.kitchenId,
  sourceId: () => props.sourceId,
})
const files = computed(() =>
  context.source.value?.files?.length
    ? context.source.value.files
    : context.source.value?.file_url
      ? [
          {
            file_url: context.source.value.file_url,
            file_name: context.source.value.file_name,
            storage_path: context.source.value.storage_path,
          },
        ]
      : []
)
</script>
