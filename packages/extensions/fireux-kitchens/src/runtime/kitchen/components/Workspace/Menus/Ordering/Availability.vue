<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: share per-surface operational availability editing. -->
<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">
          Operational availability
        </h3>
        <p class="text-sm text-dimmed">
          Pause new {{ surfaceLabel }} orders without changing service hours or
          disabling the surface.
        </p>
      </div>
    </template>

    <div class="grid gap-5">
      <MoleculesFormsEditableCheckbox
        :label="`Accepting ${surfaceLabel} orders`"
        display-label="Current operational state"
        :checkbox-label="`Accept new ${surfaceLabel} orders`"
        true-label="Accepting orders"
        false-label="Paused"
        :value="acceptingOrders"
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update="updateAcceptingOrders"
      />

      <MoleculesFormsEditableSimpleField
        label="Pause message"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :value="pauseMessage"
        :placeholder="defaultPauseMessage"
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update="updatePauseMessage"
      />

      <UAlert
        v-if="!acceptingOrders"
        color="warning"
        variant="soft"
        icon="i-lucide-pause-circle"
        :title="`${surfaceLabel} is paused`"
        :description="pauseMessage || defaultPauseMessage"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../menu/utils/kitchen-menu.ts'

type UpdateFn = (patch: Partial<MenuOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
  surfaceLabel: string
  updateFunction: UpdateFn
}>()
const defaultPauseMessage = computed(
  () => `${props.surfaceLabel} is temporarily paused. Please try again later.`
)
const acceptingOrders = computed(
  () => props.config.availability?.paused !== true
)
const pauseMessage = computed(() =>
  String(props.config.availability?.message || '')
)

const updateAcceptingOrders = (value: boolean) =>
  props.updateFunction({
    availability: {
      paused: !value,
    },
  })
const updatePauseMessage = (value: string) =>
  props.updateFunction({
    availability: {
      message: value,
    },
  })
</script>
