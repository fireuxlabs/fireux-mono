<template>
  <section
    class="menu-order-pre-order-plan"
    data-menu-pre-order-plan="advance-table"
    :data-menu-pre-order-plan-state="ready ? 'ready' : 'incomplete'"
    aria-labelledby="menu-order-pre-order-plan-title"
  >
    <header class="menu-order-pre-order-plan__header">
      <span class="menu-order-pre-order-plan__icon" aria-hidden="true">
        <UIcon name="i-lucide-calendar-range" />
      </span>

      <div>
        <p>Before you choose dishes</p>
        <h2 id="menu-order-pre-order-plan-title">Plan your table</h2>
        <span>Choose a dining time and party size first.</span>
      </div>
    </header>

    <div class="menu-order-pre-order-plan__fields">
      <div class="menu-order-pre-order-plan__field">
        <span class="menu-order-pre-order-plan__label">
          Dining date and time <span aria-hidden="true">*</span>
        </span>
        <UButton
          class="menu-order-pre-order-plan__time"
          :color="selection ? 'primary' : 'neutral'"
          icon="i-lucide-calendar-clock"
          size="xl"
          :variant="selection ? 'soft' : 'outline'"
          @click="chooseTime"
        >
          {{ selection?.label || 'Choose date and time' }}
        </UButton>
      </div>

      <div class="menu-order-pre-order-plan__field">
        <label
          class="menu-order-pre-order-plan__label"
          for="menu-order-pre-order-party-size"
        >
          Guests <span aria-hidden="true">*</span>
        </label>
        <UInput
          v-model="partySizeModel"
          :aria-describedby="
            partySizeError ? 'menu-order-pre-order-party-size-error' : undefined
          "
          :aria-invalid="Boolean(partySizeError)"
          class="menu-order-pre-order-plan__input"
          icon="i-lucide-users"
          id="menu-order-pre-order-party-size"
          inputmode="numeric"
          :max="500"
          :min="1"
          placeholder="Party size"
          size="xl"
          :step="1"
          type="number"
        />
        <p
          v-if="partySizeError"
          id="menu-order-pre-order-party-size-error"
          class="menu-order-pre-order-plan__error"
          role="alert"
        >
          {{ partySizeError }}
        </p>
      </div>
    </div>

    <p class="menu-order-pre-order-plan__state" role="status">
      <UIcon
        :name="ready ? 'i-lucide-circle-check' : 'i-lucide-info'"
        aria-hidden="true"
      />
      <span>
        {{
          ready
            ? `Ready to choose dishes for ${guestLabel}.`
            : 'The menu will open when both table details are set.'
        }}
      </span>
    </p>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 16:25 CEST — Pre-order planning repair: keep the advance-table gate deterministic across SSR and hydration.
import { computed } from 'vue'
import type { MenuOrderTimeSelection } from '../../utils/menu-order-time'

const props = defineProps<{
  partySize: string
  selection: MenuOrderTimeSelection | null
}>()

const emit = defineEmits<{
  (event: 'choose-time', trigger: HTMLButtonElement): void
  (event: 'update:partySize', value: string): void
}>()

const partySizeModel = computed({
  get: () => props.partySize,
  set: (value) => emit('update:partySize', String(value ?? '')),
})
const parsedPartySize = computed(() => Number(props.partySize))
const validPartySize = computed(
  () =>
    Number.isSafeInteger(parsedPartySize.value) &&
    parsedPartySize.value >= 1 &&
    parsedPartySize.value <= 500
)
const ready = computed(
  () => Boolean(props.selection?.requestedFor) && validPartySize.value
)
const partySizeError = computed(() =>
  props.partySize && !validPartySize.value
    ? 'Enter between 1 and 500 guests.'
    : ''
)
const guestLabel = computed(
  () =>
    `${parsedPartySize.value} ${parsedPartySize.value === 1 ? 'guest' : 'guests'}`
)

function chooseTime(event: MouseEvent) {
  const trigger = event.currentTarget
  if (trigger instanceof HTMLButtonElement) emit('choose-time', trigger)
}
</script>

<style scoped>
/* Concurrent edit — 2026-07-20 23:36 CEST — Final app CSS pass: use the Tailwind typography authority. */
.menu-order-pre-order-plan {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding: clamp(calc(var(--spacing) * 4), 4vw, calc(var(--spacing) * 6));
  border: 1px solid color-mix(in srgb, var(--menu-primary) 32%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-primary) 7%, var(--menu-bg));
  color: var(--menu-text);
  text-align: left;
}

.menu-order-pre-order-plan__header,
.menu-order-pre-order-plan__state {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: flex-start;
}

.menu-order-pre-order-plan__header p,
.menu-order-pre-order-plan__header h2,
.menu-order-pre-order-plan__state {
  margin: 0;
}

.menu-order-pre-order-plan__header p {
  color: var(--menu-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-black);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-order-pre-order-plan__header h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(var(--text-xl), 3vw, 1.65rem);
}

.menu-order-pre-order-plan__header span,
.menu-order-pre-order-plan__state {
  color: var(--menu-muted);
}

.menu-order-pre-order-plan__icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-primary) 16%, var(--menu-bg));
  color: var(--menu-primary);
  font-size: var(--text-xl);
}

.menu-order-pre-order-plan__fields {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.menu-order-pre-order-plan__field {
  display: grid;
  gap: calc(var(--spacing) * 2);
  align-content: start;
}

.menu-order-pre-order-plan__label {
  color: var(--menu-text);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.menu-order-pre-order-plan__label span,
.menu-order-pre-order-plan__error {
  color: var(--ui-error);
}

.menu-order-pre-order-plan__error {
  margin: 0;
  font-size: var(--text-sm);
}

.menu-order-pre-order-plan__time,
.menu-order-pre-order-plan__input {
  width: 100%;
}

.menu-order-pre-order-plan__time {
  justify-content: flex-start;
}

.menu-order-pre-order-plan__state {
  padding-top: calc(var(--spacing) * 3);
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.menu-order-pre-order-plan[data-menu-pre-order-plan-state='ready']
  .menu-order-pre-order-plan__state {
  color: var(--menu-primary);
}

@media (min-width: 40rem) {
  .menu-order-pre-order-plan__fields {
    grid-template-columns: minmax(0, 2fr) minmax(9rem, 1fr);
  }
}
</style>
