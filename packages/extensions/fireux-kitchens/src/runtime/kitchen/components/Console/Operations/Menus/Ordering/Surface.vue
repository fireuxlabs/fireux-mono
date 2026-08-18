<template>
  <section
    class="rounded-md border p-3 transition-colors"
    :class="active
      ? 'border-primary/50 bg-primary/5'
      : 'border-default bg-default/60'"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <h3 class="text-sm font-bold text-highlighted">
          {{ surface.label }}
        </h3>
        <p class="text-sm leading-5 text-dimmed">
          {{ surface.description }}
        </p>
      </div>

      <USwitch
        v-if="singleChoice"
        :model-value="active"
        :disabled="disabled"
        :aria-label="`${active ? 'Disable' : 'Enable'} ${surface.label}`"
        @update:model-value="emit('toggle', singleChoice.type, Boolean($event))"
      />
    </div>

    <code
      v-if="surface.route"
      class="mt-3 inline-block break-all rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
    >
      {{ surface.route }}
    </code>

    <div v-if="!singleChoice" class="mt-3 grid gap-2">
      <ConsoleKitchenOperationsMenusOrderingChoice
        v-for="choice in surface.choices"
        :key="choice.type"
        :choice="choice"
        :enabled="enabledTypes.includes(choice.type)"
        :disabled="disabled"
        @toggle="emit('toggle', choice.type, $event)"
      />
    </div>

    <UButton
      v-if="surface.settingsPath && active"
      :to="settingsRoute"
      color="neutral"
      variant="soft"
      size="sm"
      block
      trailing-icon="i-lucide-chevron-right"
      class="mt-3"
    >
      Configure {{ surface.label }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrderType } from '../../../../../models/order.model.ts'
import type { MenuOrderSurfaceOption } from '../../../../../../menu/utils/menu-console-ordering-surfaces'

const props = defineProps<{
  disabled?: boolean
  enabledTypes: KitchenOrderType[]
  menuId: string
  surface: MenuOrderSurfaceOption
}>()
const emit = defineEmits<{
  toggle: [type: KitchenOrderType, enabled: boolean]
}>()
const active = computed(() =>
  props.surface.choices.some(choice => props.enabledTypes.includes(choice.type))
)
const singleChoice = computed(() =>
  props.surface.choices.length === 1 ? props.surface.choices[0] : null
)
const settingsRoute = computed(() =>
  `/console/kitchen/menus/${encodeURIComponent(props.menuId)}/ordering/${props.surface.settingsPath}`
)
</script>
