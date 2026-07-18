<template>
  <UCard>
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-highlighted">Operational availability</h3>
        <p class="text-sm text-dimmed">
          Pause new Collection orders without changing service hours or disabling the surface.
        </p>
      </div>
    </template>

    <div class="grid gap-5">
      <MoleculesFormsFirestoreCheckbox
        label="Accepting Collection orders"
        display-label="Current operational state"
        checkbox-label="Accept new Collection orders"
        true-label="Accepting orders"
        false-label="Paused"
        :firebase-value="acceptingOrders"
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update-function="updateAcceptingOrders"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Pause message"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :firebase-value="pauseMessage"
        placeholder="Collection is temporarily paused. Please try again later."
        :disabled="disabled"
        disabled-message="This menu is read-only."
        :update-function="updatePauseMessage"
      />

      <UAlert
        v-if="!acceptingOrders"
        color="warning"
        variant="soft"
        icon="i-lucide-pause-circle"
        title="Collection is paused"
        :description="pauseMessage || defaultPauseMessage"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../../models/kitchen/menu/kitchen-menu.model'

type UpdateFn = (patch: Partial<MenuOrderTypeConfig>) => Promise<void>

const props = defineProps<{
  config: MenuOrderTypeConfig
  disabled?: boolean
  updateFunction: UpdateFn
}>()
const defaultPauseMessage = 'Collection is temporarily paused. Please try again later.'
const acceptingOrders = computed(() => props.config.availability?.paused !== true)
const pauseMessage = computed(() => String(props.config.availability?.message || ''))

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
