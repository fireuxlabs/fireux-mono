<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: expose focused settings for configured order surfaces. -->
<template>
  <div class="flex items-start justify-between gap-3 rounded-md border border-default bg-default/80 p-3">
    <div class="min-w-0 space-y-1">
      <p class="text-sm font-semibold text-highlighted">
        {{ choice.label }}
      </p>
      <p class="text-xs leading-5 text-dimmed">
        {{ choice.description }}
      </p>
      <code
        v-if="choice.route"
        class="inline-block break-all rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
      >
        {{ choice.route }}
      </code>
    </div>

    <USwitch
      :model-value="enabled"
      :disabled="disabled"
      :aria-label="`${enabled ? 'Disable' : 'Enable'} ${choice.label}`"
      @update:model-value="emit('toggle', Boolean($event))"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderTypeChoice } from '../../../../../../menu/utils/menu-console-ordering-surfaces'

defineProps<{
  choice: MenuOrderTypeChoice
  disabled?: boolean
  enabled: boolean
}>()
const emit = defineEmits<{
  toggle: [enabled: boolean]
}>()
</script>
