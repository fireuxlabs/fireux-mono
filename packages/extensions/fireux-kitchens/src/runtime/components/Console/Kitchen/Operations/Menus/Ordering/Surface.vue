<template>
  <section
    class="rounded-md border p-3 transition-colors"
    :class="active
      ? 'border-primary/50 bg-primary/5'
      : 'border-default bg-default/60'"
  >
    <div class="min-w-0 space-y-1">
      <h3 class="text-sm font-bold text-highlighted">
        {{ surface.label }}
      </h3>
      <p class="text-sm leading-5 text-dimmed">
        {{ surface.description }}
      </p>
    </div>

    <code
      v-if="surface.route"
      class="mt-3 inline-block break-all rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
    >
      {{ surface.route }}
    </code>

    <div class="mt-3 grid gap-2">
      <ConsoleKitchenOperationsMenusOrderingChoice
        v-for="choice in surface.choices"
        :key="choice.type"
        :choice="choice"
        :menu-id="menuId"
        :enabled="enabledTypes.includes(choice.type)"
        :disabled="disabled"
        @toggle="emit('toggle', choice.type, $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import type { MenuOrderSurfaceOption } from '../../../../../../utils/menu-console-ordering-surfaces'

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
</script>
