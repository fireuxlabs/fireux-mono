<template>
  <section class="workspace-surface">
    <FireCopyError v-if="sourceError" :message="String(sourceError)" />
    <p v-else-if="sourcePending" role="status">Loading source…</p>
    <UCard v-else-if="source && !menu">
      <template #header>
        <div class="workspace-surface workspace-surface--compact">
          <h2 class="fx-type-card-heading">Process {{ sourceLabel }}</h2>
          <p class="fx-type-caption">
            Convert this saved source into a review draft.
          </p>
        </div>
      </template>

      <KitchenFoodAndDrinkMenusProcess :context="context" />
    </UCard>

    <UCard v-else-if="menu || source">
      <template #header>
        <div class="workspace-surface workspace-surface--compact">
          <h2 class="fx-type-card-heading">
            Source document and AI processing
          </h2>
          <p class="fx-type-caption">
            Keep the original source separate from the published Menu.
          </p>
        </div>
      </template>

      <div class="workspace-surface">
        <section
          v-if="menu"
          class="workspace-surface workspace-surface--compact"
        >
          <KitchenFoodAndDrinkMenusCreateUpload
            :upload-id="menuId"
            :replace-existing="true"
            description="Attach the original files before comparing processed output with this Menu."
            cta-label="Upload source"
          />
        </section>

        <FireDisclosurePanel title="Processing tools" :default-open="false">
          <div class="workspace-surface workspace-surface--compact">
            <KitchenFoodAndDrinkMenusProcess :context="context" />
          </div>
        </FireDisclosurePanel>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No Menu source"
      description="Choose a Menu or source from the Menus index."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'

const context = useKitchenMenuRecordContext()
const { menu, menuId, source, sourcePending, sourceError } = context
const sourceLabel = computed(() =>
  String(source.value?.source_url ? 'menu URL' : 'menu source')
)
</script>
