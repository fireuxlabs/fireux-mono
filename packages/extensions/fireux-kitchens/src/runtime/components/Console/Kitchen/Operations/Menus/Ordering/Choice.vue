<template>
  <div class="grid gap-2">
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

    <UButton
      v-if="choice.settingsPath && enabled"
      :to="settingsRoute"
      color="neutral"
      variant="soft"
      size="sm"
      block
      trailing-icon="i-lucide-chevron-right"
    >
      Configure {{ choice.label }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderTypeChoice } from '../../../../../../utils/menu-console-ordering-surfaces'

const props = defineProps<{
  choice: MenuOrderTypeChoice
  disabled?: boolean
  enabled: boolean
  menuId: string
}>()
const emit = defineEmits<{
  toggle: [enabled: boolean]
}>()
const settingsRoute = computed(() =>
  `/console/kitchen/menus/${encodeURIComponent(props.menuId)}/ordering/${props.choice.settingsPath}`
)
</script>
