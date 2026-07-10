<template>
  <div
    v-if="useHomeSelector"
    class="menu-choice-stack"
  >
    <USelect
      class="menu-method-select"
      :model-value="modelValue"
      :items="homeSelectOptions"
      value-key="value"
      label-key="label"
      aria-label="Fulfilment method"
      @update:model-value="selectValue"
    />
  </div>

  <div
    v-else-if="useCampSelector || useDineInOnlySelector || useTakeAwayOnlySelector"
    class="menu-choice-stack"
  >
    <div
      v-if="useCampSelector"
      class="menu-choice-row"
      aria-label="Menu mode"
    >
      <template
        v-for="camp in campOptions"
        :key="camp.value"
      >
        <UButton
          v-if="camp.option.to"
          :to="camp.option.to"
          color="neutral"
          size="sm"
          :variant="activeCamp === camp.value ? 'solid' : 'soft'"
          :label="camp.label"
          :aria-label="camp.label"
        />

        <UButton
          v-else
          type="button"
          color="neutral"
          size="sm"
          :variant="activeCamp === camp.value ? 'solid' : 'soft'"
          :label="camp.label"
          :aria-pressed="activeCamp === camp.value"
          @click="selectOption(camp.option)"
        />
      </template>
    </div>

    <div
      v-if="showMethodSelector"
      class="menu-choice-row"
      role="radiogroup"
      :aria-label="methodSelectorLabel"
    >
      <template
        v-for="option in methodOptions"
        :key="option.value"
      >
        <UButton
          v-if="option.to"
          :to="option.to"
          color="neutral"
          size="xs"
          :variant="modelValue === option.value ? 'solid' : 'soft'"
          :label="methodOptionLabel(option)"
          role="radio"
          :aria-checked="modelValue === option.value"
        />

        <UButton
          v-else
          type="button"
          color="neutral"
          size="xs"
          :variant="modelValue === option.value ? 'solid' : 'soft'"
          :label="methodOptionLabel(option)"
          role="radio"
          :aria-checked="modelValue === option.value"
          @click="selectOption(option)"
        />
      </template>
    </div>
  </div>

  <div
    v-else-if="options.length > 1"
    class="menu-choice-row"
  >
    <template
      v-for="option in options"
      :key="option.value"
    >
      <UButton
        v-if="option.to"
        :to="option.to"
        color="neutral"
        size="sm"
        variant="soft"
        :label="option.label"
        :aria-label="option.label"
      />

      <UButton
        v-else
        type="button"
        color="neutral"
        size="sm"
        :variant="modelValue === option.value ? 'solid' : 'soft'"
        :label="option.label"
        :aria-pressed="modelValue === option.value"
        @click="$emit('update:modelValue', option.value)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'

const props = withDefaults(
  defineProps<{
    modelValue: MenuChoiceValue
    menuContext?: string
    options?: MenuChoiceOption[]
  }>(),
  {
    menuContext: '',
    options: () => [],
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: MenuChoiceValue): void
}>()

type CampValue = 'dine_in' | 'takeaway'

type CampOption = {
  value: CampValue
  label: string
  option: MenuChoiceOption
}

const dineInOrderTypes = ['dine_in', 'pre_order', 'room_service'] as const
const takeAwayOrderTypes = ['eat_in', 'takeaway', 'collection', 'delivery'] as const
const homeOrderTypes = ['delivery', 'collection'] as const
const isTakeAwayOption = (option: MenuChoiceOption) =>
  takeAwayOrderTypes.includes(option.orderType as typeof takeAwayOrderTypes[number])
const isDineInOption = (option: MenuChoiceOption) =>
  !option.orderType ||
    dineInOrderTypes.includes(option.orderType as typeof dineInOrderTypes[number])
const isHomeOption = (option: MenuChoiceOption) =>
  homeOrderTypes.includes(option.orderType as typeof homeOrderTypes[number])

const dineInOptions = computed(() =>
  props.options.filter(isDineInOption)
)
const takeAwayOptions = computed(() =>
  props.options.filter(isTakeAwayOption)
)
const homeOptions = computed(() =>
  props.options.filter(isHomeOption)
)
const homeSelectOptions = computed(() =>
  homeOptions.value.map((option) => ({
    label: methodOptionLabel(option),
    value: option.value,
    to: option.to,
  }))
)
const useHomeSelector = computed(() =>
  homeOptions.value.length > 1 &&
    homeOptions.value.length === props.options.length
)
const currentOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
)
const currentTakeAwayOption = computed(() =>
  takeAwayOptions.value.find((option) => option.value === props.modelValue)
)
const currentDineInOption = computed(() =>
  dineInOptions.value.find((option) => option.value === props.modelValue)
)
const selectedDineInOption = computed(() =>
  currentDineInOption.value ||
    dineInOptions.value.find((option) => !option.to) ||
    dineInOptions.value[0]
)
const selectedTakeAwayOption = computed(() =>
  currentTakeAwayOption.value ||
    takeAwayOptions.value.find((option) => !option.to) ||
    takeAwayOptions.value[0]
)
const useCampSelector = computed(() =>
  Boolean(selectedDineInOption.value && selectedTakeAwayOption.value)
)
const useDineInOnlySelector = computed(() =>
  !useCampSelector.value &&
    dineInOptions.value.length > 1 &&
    dineInOptions.value.length === props.options.length
)
const useTakeAwayOnlySelector = computed(() =>
  !useCampSelector.value &&
    takeAwayOptions.value.length > 1 &&
    takeAwayOptions.value.length === props.options.length
)
const activeCamp = computed<CampValue>(() => {
  if (
    currentTakeAwayOption.value ||
    (!currentOption.value && useTakeAwayOnlySelector.value)
  ) {
    return 'takeaway'
  }

  return currentOption.value && isTakeAwayOption(currentOption.value)
    ? 'takeaway'
    : 'dine_in'
})
const campOptions = computed<CampOption[]>(() => {
  const options: CampOption[] = []

  if (selectedDineInOption.value) {
    options.push({
      value: 'dine_in',
      label: dineInOptions.value.some((option) =>
        ['pre_order', 'room_service'].includes(String(option.orderType || ''))
      ) ? 'Dining / room' : 'Table service',
      option: selectedDineInOption.value,
    })
  }
  if (selectedTakeAwayOption.value) {
    options.push({
      value: 'takeaway',
      label: takeAwayOptions.value.some((option) =>
        ['collection', 'delivery'].includes(String(option.orderType || ''))
      ) ? 'Collection / delivery' : 'Counter order',
      option: selectedTakeAwayOption.value,
    })
  }

  return options
})
const showTakeAwaySelector = computed(() =>
  takeAwayOptions.value.length > 1 &&
    (activeCamp.value === 'takeaway' || useTakeAwayOnlySelector.value)
)
const showDineInSelector = computed(() =>
  dineInOptions.value.length > 1 &&
    (activeCamp.value === 'dine_in' || useDineInOnlySelector.value)
)
const methodOptions = computed(() =>
  activeCamp.value === 'takeaway'
    ? takeAwayOptions.value
    : dineInOptions.value
)
const showMethodSelector = computed(() =>
  activeCamp.value === 'takeaway'
    ? showTakeAwaySelector.value
    : showDineInSelector.value
)
const hasKioskModes = computed(() =>
  methodOptions.value.some((option) => option.orderType === 'eat_in') ||
    methodOptions.value.some((option) => option.orderType === 'takeaway')
)
const methodSelectorLabel = computed(() => {
  if (activeCamp.value === 'takeaway') {
    return hasKioskModes.value ? 'Counter handoff' : 'Fulfilment method'
  }

  return 'Service method'
})
function methodOptionLabel(option: MenuChoiceOption) {
  return option.label
}

function selectOption(option: MenuChoiceOption) {
  emit('update:modelValue', option.value)
}

function selectValue(value: unknown) {
  const nextValue = String(value ?? '')
  if (!nextValue) return

  const option = homeOptions.value.find((entry) => entry.value === nextValue)
  if (option?.to) {
    void navigateTo(option.to)
    return
  }

  emit('update:modelValue', nextValue)
}
</script>

<style scoped>
.menu-choice-stack {
  display: grid;
  gap: var(--menu-space-xs);
  justify-items: start;
  width: auto;
}

.menu-choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  align-items: center;
  justify-content: flex-start;
}

.menu-method-select {
  width: min(100%, 14rem);
}

@media (max-width: 640px) {
  .menu-choice-stack,
  .menu-method-select {
    width: 100%;
  }
}
</style>
