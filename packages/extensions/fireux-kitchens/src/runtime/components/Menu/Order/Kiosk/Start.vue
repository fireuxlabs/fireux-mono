<!-- Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: provide a brand-aware generic entry without skin assets. -->
<template>
  <div class="menu-order-kiosk-start">
    <header class="menu-order-kiosk-start__identity">
      <img
        v-if="identityImageUrl"
        :src="identityImageUrl"
        :alt="kitchenName || menuName"
        class="menu-order-kiosk-start__wordmark"
      >
      <h1
        :class="{
          'menu-order-kiosk-start__title--visually-hidden': identityImageUrl,
        }"
      >
        {{ kitchenName || menuName }}
      </h1>
      <p v-if="kitchenName && menuName !== kitchenName">{{ menuName }}</p>
    </header>

    <div class="menu-order-kiosk-start__prompt">
      <h2>Where will you eat?</h2>
    </div>

    <div v-if="options.length" class="menu-order-kiosk-start__options">
      <button
        v-for="option in options"
        :key="option.type"
        type="button"
        class="menu-order-kiosk-start__option"
        data-menu-action="select-kiosk-mode"
        :data-menu-kiosk-mode="option.type"
        :disabled="option.paused"
        @click="$emit('select', option.type)"
      >
        <span class="menu-order-kiosk-start__option-icon" aria-hidden="true">
          <UIcon :name="option.icon" />
        </span>
        <span class="menu-order-kiosk-start__option-copy">
          <strong>{{ option.label }}</strong>
          <small v-if="option.paused">Unavailable</small>
        </span>
      </button>
    </div>

    <UAlert
      v-else
      class="menu-order-kiosk-start__unavailable"
      color="warning"
      icon="i-lucide-triangle-alert"
      title="Kiosk ordering unavailable"
      description="This Menu has no Eat here or Take away configuration."
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderKioskType } from '../../../../composables/fireux/menu/order/useMenuOrderKiosk'
import { computed } from 'vue'

type MenuOrderKioskOption = {
  type: MenuOrderKioskType
  label: string
  icon: string
  paused: boolean
}

const props = defineProps<{
  menuName: string
  options: MenuOrderKioskOption[]
  kitchenName?: string
  logoImageUrl?: string
  wordmarkImageUrl?: string
}>()

defineEmits<{
  (event: 'select', type: MenuOrderKioskType): void
}>()

const identityImageUrl = computed(() =>
  String(props.wordmarkImageUrl || props.logoImageUrl || '').trim()
)
</script>

<style scoped>
.menu-order-kiosk-start {
  position: relative;
  display: grid;
  width: min(100%, 64rem);
  min-height: 100%;
  align-content: center;
  gap: clamp(2.5rem, 7vh, 5rem);
  margin: 0 auto;
  padding:
    max(2rem, env(safe-area-inset-top))
    clamp(1.25rem, 5vw, 5rem)
    max(2rem, env(safe-area-inset-bottom));
}

.menu-order-kiosk-start__identity {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  text-align: center;
}

.menu-order-kiosk-start__identity h1,
.menu-order-kiosk-start__identity p,
.menu-order-kiosk-start__prompt h2 {
  margin: 0;
}

.menu-order-kiosk-start__identity h1 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.45rem, 3vw, 2.35rem);
  line-height: 1.1;
}

.menu-order-kiosk-start__wordmark {
  width: min(100%, 24rem);
  max-height: 9rem;
  object-fit: contain;
}

.menu-order-kiosk-start__identity p {
  color: var(--menu-muted);
  font-size: clamp(0.95rem, 1.7vw, 1.15rem);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-order-kiosk-start__title--visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.menu-order-kiosk-start__prompt {
  text-align: center;
}

.menu-order-kiosk-start__prompt h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2.75rem, 6vw, 4.75rem);
  font-weight: var(--font-weight-black);
  line-height: 1;
  letter-spacing: -0.04em;
}

.menu-order-kiosk-start__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

.menu-order-kiosk-start__option {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  min-height: clamp(7.5rem, 14vh, 10rem);
  padding: clamp(1.25rem, 2.8vw, 2rem);
  border: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-bg) 89%, var(--menu-primary));
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  text-align: left;
  box-shadow: 0 1.2rem 3rem color-mix(in srgb, var(--menu-text) 8%, transparent);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.menu-order-kiosk-start__option:hover,
.menu-order-kiosk-start__option:focus-visible {
  border-color: color-mix(in srgb, var(--menu-primary) 58%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 11%, var(--menu-bg));
  transform: translateY(-0.16rem);
}

.menu-order-kiosk-start__option:focus-visible {
  outline: 3px solid var(--menu-primary);
  outline-offset: 0.25rem;
}

.menu-order-kiosk-start__option:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.menu-order-kiosk-start__option-icon {
  display: grid;
  width: clamp(4rem, 7vw, 5.5rem);
  height: clamp(4rem, 7vw, 5.5rem);
  place-items: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--menu-primary) 12%, var(--menu-bg));
  color: var(--menu-primary);
  font-size: clamp(1.65rem, 3vw, 2.35rem);
}

.menu-order-kiosk-start__option-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.menu-order-kiosk-start__option-copy strong {
  color: var(--menu-title);
  font-size: clamp(1.55rem, 3vw, 2.25rem);
  line-height: 1.1;
}

.menu-order-kiosk-start__option-copy small {
  color: var(--menu-muted);
  font-size: clamp(0.8rem, 1.5vw, 0.95rem);
  font-weight: var(--font-weight-bold);
}

.menu-order-kiosk-start__unavailable {
  width: min(100%, 38rem);
  justify-self: center;
}

@media (max-width: 700px) {
  .menu-order-kiosk-start {
    align-content: start;
    gap: 2rem;
    overflow-y: auto;
  }

  .menu-order-kiosk-start__options {
    grid-template-columns: 1fr;
  }

  .menu-order-kiosk-start__option {
    min-height: 6.5rem;
  }
}
</style>
