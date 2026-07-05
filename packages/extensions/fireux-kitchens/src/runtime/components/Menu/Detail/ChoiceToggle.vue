<template>
  <div
    v-if="useCampSelector || useTakeAwayOnlySelector"
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
      v-if="showTakeAwaySelector"
      class="menu-takeaway"
      role="radiogroup"
      aria-label="Take away method"
    >
      <template
        v-for="option in takeAwayOptions"
        :key="option.value"
      >
        <NuxtLink
          v-if="option.to"
          :to="option.to"
          :class="[
            'menu-takeaway__option',
            { 'menu-takeaway__option--active': modelValue === option.value },
          ]"
          role="radio"
          :aria-checked="modelValue === option.value"
        >
          <span class="menu-takeaway__radio" aria-hidden="true" />
          <span>{{ option.label }}</span>
        </NuxtLink>

        <label
          v-else
          :class="[
            'menu-takeaway__option',
            { 'menu-takeaway__option--active': modelValue === option.value },
          ]"
        >
          <input
            :name="takeAwayRadioName"
            type="radio"
            :checked="modelValue === option.value"
            @change="selectOption(option)"
          >
          <span>{{ option.label }}</span>
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
    options?: MenuChoiceOption[]
  }>(),
  {
    options: () => [],
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: MenuChoiceValue): void
}>()

type CampValue = 'dine_in' | 'take_away'

type CampOption = {
  value: CampValue
  label: string
  option: MenuChoiceOption
}

const takeAwayOrderTypes = ['collection', 'delivery'] as const
const safeToken = (value: string) => value.replace(/[^a-z0-9_-]+/gi, '-')
const isTakeAwayOption = (option: MenuChoiceOption) =>
  takeAwayOrderTypes.includes(option.orderType as typeof takeAwayOrderTypes[number])
const isDineInOption = (option: MenuChoiceOption) =>
  option.orderType === 'dine_in' || !option.orderType

const dineInOption = computed(() =>
  props.options.find(isDineInOption)
)
const takeAwayOptions = computed(() =>
  props.options.filter(isTakeAwayOption)
)
const currentOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue)
)
const currentTakeAwayOption = computed(() =>
  takeAwayOptions.value.find((option) => option.value === props.modelValue)
)
const selectedTakeAwayOption = computed(() =>
  currentTakeAwayOption.value ||
    takeAwayOptions.value.find((option) => !option.to) ||
    takeAwayOptions.value[0]
)
const useCampSelector = computed(() =>
  Boolean(dineInOption.value && selectedTakeAwayOption.value)
)
const useTakeAwayOnlySelector = computed(() =>
  !useCampSelector.value &&
    takeAwayOptions.value.length > 1 &&
    takeAwayOptions.value.length === props.options.length
)
const activeCamp = computed<CampValue>(() =>
  currentTakeAwayOption.value ||
    (
      !currentOption.value &&
      useTakeAwayOnlySelector.value
    )
    ? 'take_away'
    : 'dine_in'
)
const campOptions = computed<CampOption[]>(() => {
  const options: CampOption[] = []

  if (dineInOption.value) {
    options.push({
      value: 'dine_in',
      label: 'Dine in',
      option: dineInOption.value,
    })
  }
  if (selectedTakeAwayOption.value) {
    options.push({
      value: 'take_away',
      label: 'Take away',
      option: selectedTakeAwayOption.value,
    })
  }

  return options
})
const showTakeAwaySelector = computed(() =>
  takeAwayOptions.value.length > 1 &&
    (activeCamp.value === 'take_away' || useTakeAwayOnlySelector.value)
)
const takeAwayRadioName = computed(() =>
  `menu-takeaway-${safeToken(takeAwayOptions.value.map((option) => option.value).join('-'))}`
)

function selectOption(option: MenuChoiceOption) {
  emit('update:modelValue', option.value)
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

.menu-takeaway {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--menu-space-xs);
  justify-content: center;
  width: 100%;
}

.menu-takeaway__option {
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

.menu-takeaway__option input {
  width: 0.95rem;
  height: 0.95rem;
  margin: 0;
  accent-color: var(--menu-primary);
}

.menu-takeaway__radio {
  width: 0.95rem;
  height: 0.95rem;
  border: 2px solid currentcolor;
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.18rem var(--menu-bg);
}

.menu-takeaway__option--active {
  border-color: color-mix(in srgb, var(--menu-primary) 58%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 12%, var(--menu-bg));
}

.menu-takeaway__option--active .menu-takeaway__radio {
  background: var(--menu-primary);
}

@media (max-width: 520px) {
  .menu-choice-stack,
  .menu-mode {
    grid-auto-columns: 1fr;
    width: 100%;
  }
}
</style>
