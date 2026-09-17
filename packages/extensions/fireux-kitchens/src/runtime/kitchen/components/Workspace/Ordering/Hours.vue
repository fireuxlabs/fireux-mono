<template>
  <section class="service-hours">
    <MoleculesStateCard
      v-if="hoursOutcome === 'pending' || hoursOutcome === 'idle'"
      entity="Kitchen hours"
      loading
    />
    <MoleculesStateCard
      v-else-if="hoursOutcome === 'error'"
      entity="Kitchen hours"
      state="error"
    />
    <template v-else>
      <MoleculesFormsEditableCheckbox
        :label="
          config.type === 'pre_order' ? 'Dining hours' : `${serviceLabel} hours`
        "
        display-label="Schedule"
        checkbox-label="Use Kitchen hours"
        true-label="Use Kitchen hours"
        false-label="Use separate service hours"
        :value="inheritKitchenHours"
        :disabled="disabled"
        disabled-message="This Kitchen is read-only."
        :update="updateHoursInheritance"
      />
      <div v-if="inheritKitchenHours" class="service-hours__inherited">
        <p>
          {{
            kitchenHours.source === 'place'
              ? 'Kitchen hours follow venue opening hours.'
              : 'The Kitchen has its own operating hours.'
          }}
        </p>
        <p v-if="inheritedHoursSummary" class="service-hours__schedule">
          {{ inheritedHoursSummary }}
        </p>
        <UAlert
          v-else
          color="warning"
          title="No Kitchen hours set"
          description="Set Kitchen hours or choose separate hours for this service."
        />
      </div>
      <MoleculesFormsEditableSimpleField
        v-else
        :label="
          config.type === 'pre_order'
            ? 'Available dining times'
            : `${serviceLabel} fulfilment hours`
        "
        type="textarea"
        :rows="7"
        :value="customHoursText"
        placeholder="Tuesday - Saturday 17:00 - 22:00"
        :disabled="disabled"
        disabled-message="This Kitchen is read-only."
        :validation-function="validateCustomHours"
        :update="updateCustomHours"
      />
      <p v-if="!inheritKitchenHours">
        These hours apply to every Menu in this service. Venue and Kitchen hours
        stay unchanged.
      </p>
      <footer class="service-hours__footer">
        <span v-if="kitchenHours.timezone">{{ kitchenHours.timezone }}</span>
        <UButton
          to="/workspace/kitchen/identity/operating-hours"
          label="Venue & Kitchen hours"
          trailing-icon="i-lucide-arrow-up-right"
          color="neutral"
          variant="link"
        />
      </footer>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
import type { WeekdayTimeWindowsConfig } from '../../../../models/shared/weekday-time.model'
import {
  formatWeekdayTimeText,
  parseWeekdayTimeText,
} from '../../../../utils/weekday-time'

const props = defineProps<{
  config: KitchenOrderTypeConfig
  kitchenHours: WeekdayTimeWindowsConfig
  hoursOutcome?: string
  serviceLabel: string
  disabled?: boolean
  updateFunction: (patch: Partial<KitchenOrderTypeConfig>) => Promise<void>
}>()
const customRequested = ref(false)
watch(
  () => props.config,
  () => {
    customRequested.value = false
  }
)
const inheritKitchenHours = computed(
  () =>
    !customRequested.value &&
    props.config.service_hours?.inherit_kitchen_operation_hours !== false
)
const customHoursText = computed(() =>
  formatWeekdayTimeText(props.config.service_hours?.operation_hours)
)
const inheritedHoursSummary = computed(() =>
  formatWeekdayTimeText(props.kitchenHours)
)
function validateCustomHours(value: string) {
  try {
    if (!props.kitchenHours.timezone)
      throw new Error('Set the venue timezone before saving service hours.')
    if (
      !parseWeekdayTimeText(value, props.kitchenHours.timezone).windows.length
    )
      throw new Error('Add at least one service-hours range.')
    return { isValid: true }
  } catch (cause) {
    return {
      isValid: false,
      message:
        cause instanceof Error ? cause.message : 'Service hours are invalid.',
    }
  }
}
async function updateHoursInheritance(value: boolean) {
  if (!value) {
    customRequested.value = true
    return
  }
  await props.updateFunction({
    service_hours: { inherit_kitchen_operation_hours: true },
  })
  customRequested.value = false
}
async function updateCustomHours(value: string) {
  const validation = validateCustomHours(value)
  if (!validation.isValid) throw new Error(validation.message)
  await props.updateFunction({
    service_hours: {
      inherit_kitchen_operation_hours: false,
      operation_hours: parseWeekdayTimeText(value, props.kitchenHours.timezone),
    },
  })
}
</script>

<style scoped>
.service-hours {
  display: grid;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ui-border);
}
.service-hours p {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.service-hours__inherited {
  display: grid;
  gap: 0.75rem;
}
.service-hours .service-hours__schedule {
  white-space: pre-line;
  color: var(--ui-text-highlighted);
  font-variant-numeric: tabular-nums;
}
.service-hours__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
</style>
