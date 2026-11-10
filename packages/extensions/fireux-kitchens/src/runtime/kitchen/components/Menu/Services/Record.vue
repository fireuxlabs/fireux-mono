<template>
  <div
    :id="anchor"
    :aria-label="name"
    tabindex="-1"
    class="workspace-surface workspace-surface--compact"
  >
    <h3 v-if="offering && name !== option.label">{{ name }}</h3>
    <USwitch
      :model-value="editor.enabled"
      :label="editor.enabled ? 'On' : 'Off'"
      :aria-label="name + ' availability'"
      :disabled="disabled"
      @update:model-value="editor.setEnabled"
    />
    <p v-if="services.length > 1">
      {{ services.map((service) => service.label).join(' and ') }} share this
      setup’s availability, menus and serving hours.
    </p>
    <template v-if="services.length > 1 && editor.enabled">
      <USwitch
        v-for="interaction in editor.interactions"
        :key="interaction.type"
        :model-value="interaction.enabled"
        :label="kitchenOrderTypeLabel(interaction.type)"
        :disabled="disabled"
        @update:model-value="
          editor.setInteractionEnabled(interaction.type, $event)
        "
      />
    </template>
    <span v-if="editor.enabled && !readiness.canEnable">{{
      !editor.menuIds.length
        ? 'Needs menus'
        : !readiness.validSelection
          ? 'Replace unavailable menus'
          : 'Publish a selected menu'
    }}</span>
    <span v-if="editor.busy" role="status">Updating…</span>
    <FireCopyError v-if="editor.error" :message="editor.error" />
    <KitchenMenuServicesSetup v-if="editor.enabled" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenServiceEditor } from '../../../composables/offerings/useKitchenServiceEditor'
import type { KitchenOffering } from '../../../models/offering.model'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import type { KitchenOfferingOption } from '../../../utils/offering-options'
const props = defineProps<{
  option: KitchenOfferingOption
  offering?: KitchenOffering
  anchor?: string
}>()
const { editor, services, readiness, disabled } = provideKitchenServiceEditor(
  props.option,
  () => props.offering
)
const name = computed(() => props.offering?.name || props.option.label)
</script>
