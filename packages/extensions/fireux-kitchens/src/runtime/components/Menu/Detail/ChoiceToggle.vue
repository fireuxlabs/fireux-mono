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
      class="menu-mode"
      aria-label="Menu mode"
    >
      <template
        v-for="camp in campOptions"
        :key="camp.value"
      >
        <NuxtLink
          v-if="camp.option.to"
          :to="camp.option.to"
          :class="['menu-mode__button', { 'is-active': activeCamp === camp.value }]"
          :aria-label="camp.label"
        >
          {{ camp.label }}
        </NuxtLink>

        <button
          v-else
          type="button"
          :class="['menu-mode__button', { 'is-active': activeCamp === camp.value }]"
          :aria-pressed="activeCamp === camp.value"
          @click="selectOption(camp.option)"
        >
          {{ camp.label }}
        </button>
      </template>
    </div>

    <div
      v-if="showMethodSelector"
      class="menu-method"
      role="radiogroup"
      :aria-label="methodSelectorLabel"
    >
      <template
        v-for="option in methodOptions"
        :key="option.value"
      >
        <NuxtLink
          v-if="option.to"
          :to="option.to"
          :class="[
            'menu-method__option',
            { 'menu-method__option--active': modelValue === option.value },
          ]"
          role="radio"
          :aria-checked="modelValue === option.value"
        >
          <span class="menu-method__radio" aria-hidden="true" />
          <span>{{ methodOptionLabel(option) }}</span>
        </NuxtLink>

        <label
          v-else
          :class="[
            'menu-method__option',
            { 'menu-method__option--active': modelValue === option.value },
          ]"
        >
          <input
            :name="methodRadioName"
            type="radio"
            :checked="modelValue === option.value"
            @change="selectOption(option)"
          >
          <span>{{ methodOptionLabel(option) }}</span>
        </label>
      </template>
    </div>
  </div>

  <div v-else-if="options.length > 1" class="menu-mode">
    <template
      v-for="option in options"
      :key="option.value"
    >
      <NuxtLink
        v-if="option.to"
        :to="option.to"
        class="menu-mode__button"
        :aria-label="option.label"
      >
        {{ option.label }}
      </NuxtLink>

      <button
        v-else
        type="button"
        :class="['menu-mode__button', { 'is-active': modelValue === option.value }]"
        :aria-pressed="modelValue === option.value"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuChoiceOption,
  MenuChoiceValue,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'

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
const safeToken = (value: string) => value.replace(/[^a-z0-9_-]+/gi, '-')
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
  }))
)
const useHomeSelector = computed(() =>
  props.menuContext === 'home' &&
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
      label: 'Dine in',
      option: selectedDineInOption.value,
    })
  }
  if (selectedTakeAwayOption.value) {
    options.push({
      value: 'takeaway',
      label: 'Takeaway',
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
    return hasKioskModes.value ? 'Kiosk fulfilment' : 'Fulfilment method'
  }

  return 'Dine in service'
})
const methodRadioName = computed(() =>
  `menu-method-${safeToken(methodOptions.value.map((option) => option.value).join('-'))}`
)

function methodOptionLabel(option: MenuChoiceOption) {
  return option.label
}

function selectOption(option: MenuChoiceOption) {
  emit('update:modelValue', option.value)
}

function selectValue(value: unknown) {
  const nextValue = String(value ?? '')
  if (nextValue) emit('update:modelValue', nextValue)
}
</script>

<style scoped>
.menu-choice-stack {
  display: grid;
  gap: var(--menu-space-xs);
  justify-items: center;
  width: min(100%, 32rem);
}

.menu-mode {
  display: inline-grid;
  grid-auto-columns: minmax(7rem, 1fr);
  grid-auto-flow: column;
  gap: var(--menu-space-xs);
  width: min(100%, 32rem);
  padding: var(--menu-space-xs);
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 88%, var(--menu-text));
}

.menu-mode__button {
  appearance: none;
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  padding: 0.58rem var(--menu-space-md);
  border: 0;
  border-radius: var(--menu-radius-control);
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 850;
  letter-spacing: 0;
  text-decoration: none;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.menu-mode__button:hover {
  background: color-mix(in srgb, var(--menu-text) 8%, transparent);
}

.menu-mode__button.is-active {
  background: var(--menu-text);
  color: var(--menu-bg);
  transform: translateY(-1px);
}

.menu-method {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  justify-content: center;
  width: 100%;
}

.menu-method__option {
  display: inline-flex;
  min-height: 2.35rem;
  align-items: center;
  gap: 0.48rem;
  justify-content: center;
  padding: 0.42rem 0.78rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-bg) 92%, var(--menu-text));
  color: var(--menu-text);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0;
  line-height: 1.2;
  text-decoration: none;
}

.menu-method__option input {
  width: 0.95rem;
  height: 0.95rem;
  margin: 0;
  accent-color: var(--menu-primary);
}

.menu-method__radio {
  width: 0.95rem;
  height: 0.95rem;
  border: 2px solid currentcolor;
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.18rem var(--menu-bg);
}

.menu-method__option--active {
  border-color: color-mix(in srgb, var(--menu-primary) 58%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 12%, var(--menu-bg));
}

.menu-method__option--active .menu-method__radio {
  background: var(--menu-primary);
}

.menu-method-select {
  width: min(100%, 18rem);
}

@media (max-width: 520px) {
  .menu-choice-stack,
  .menu-mode {
    grid-auto-columns: 1fr;
    width: 100%;
  }
}
</style>
