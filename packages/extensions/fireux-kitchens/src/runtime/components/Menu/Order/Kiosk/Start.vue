<!-- Concurrent edit — 2026-07-22 11:58 CEST — Out-of-box Kiosk design: provide a brand-aware generic entry without skin assets. -->
<template>
  <div class="menu-order-kiosk-start" :style="backgroundStyle">
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
    </header>

    <div class="menu-order-kiosk-start__prompt">
      <h2>Welcome!</h2>
      <p v-if="kitchenTagline">{{ kitchenTagline }}</p>
    </div>

    <div
      v-if="options.length"
      class="menu-order-kiosk-start__options"
      :class="{ 'menu-order-kiosk-start__options--portrait-cards': hasChoiceArtwork }"
    >
      <button
        v-for="option in options"
        :key="option.type"
        type="button"
        class="menu-order-kiosk-start__option"
        :class="{ 'menu-order-kiosk-start__option--artwork': optionArtworkUrl(option.type) }"
        data-menu-action="select-kiosk-mode"
        :data-menu-kiosk-mode="option.type"
        :disabled="option.paused"
        @click="$emit('select', option.type)"
      >
        <img
          v-if="optionArtworkUrl(option.type)"
          :src="optionArtworkUrl(option.type)"
          :alt="`${option.label}. ${option.description}`"
          class="menu-order-kiosk-start__option-artwork"
        >
        <template v-else>
          <span class="menu-order-kiosk-start__option-icon" aria-hidden="true">
            <UIcon :name="option.icon" />
          </span>
          <span class="menu-order-kiosk-start__option-copy">
            <strong>{{ option.label }}</strong>
            <span>{{ option.description }}</span>
            <small v-if="option.paused">Unavailable</small>
          </span>
        </template>
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
import type { MenuManifestSection } from '../../../../models/kitchen/menu/menu-detail.model'
import { computed } from 'vue'

type MenuOrderKioskOption = {
  type: MenuOrderKioskType
  label: string
  icon: string
  description: string
  paused: boolean
}

const props = defineProps<{
  menuName: string
  options: MenuOrderKioskOption[]
  sections: MenuManifestSection[]
  backdropImageUrl?: string
  eatInCardImageUrl?: string
  kitchenName?: string
  kitchenTagline?: string
  logoImageUrl?: string
  wordmarkImageUrl?: string
  takeawayCardImageUrl?: string
}>()

defineEmits<{
  (event: 'select', type: MenuOrderKioskType): void
}>()

const identityImageUrl = computed(() =>
  String(props.logoImageUrl || props.wordmarkImageUrl || '').trim()
)
const hasChoiceArtwork = computed(() => Boolean(String(props.eatInCardImageUrl || props.takeawayCardImageUrl || '').trim()))
const optionArtworkUrl = (type: MenuOrderKioskType) =>
  String((type === 'eat_in' ? props.eatInCardImageUrl : props.takeawayCardImageUrl) || '').trim()
const backgroundStyle = computed(() => {
  const imageUrl = String(props.backdropImageUrl || '').trim()

  return imageUrl
    ? { '--menu-kiosk-start-image': `url('${imageUrl}')` }
    : undefined
})
</script>

<style scoped>
@import './start-landscape.css';
.menu-order-kiosk-start {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 100%;
  align-content: center;
  gap: clamp(
    calc(var(--spacing) * 10),
    7vh,
    calc(var(--spacing) * 20)
  );
  overflow: hidden;
  background-color: #f4efe4;
  background-image: var(--menu-kiosk-start-image);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  color: #033723;
  padding:
    max(calc(var(--spacing) * 8), env(safe-area-inset-top))
    clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 20))
    max(calc(var(--spacing) * 8), env(safe-area-inset-bottom));
}

.menu-order-kiosk-start__identity,
.menu-order-kiosk-start__prompt,
.menu-order-kiosk-start__options,
.menu-order-kiosk-start__unavailable {
  position: relative;
  z-index: 1;
  width: min(82%, 64rem);
  justify-self: center;
}

.menu-order-kiosk-start__identity {
  animation: kiosk-start-enter 520ms ease-out both;
}
.menu-order-kiosk-start__prompt {
  animation: kiosk-start-enter 600ms 90ms ease-out both;
}

.menu-order-kiosk-start__option {
  animation:
    kiosk-option-enter 520ms 180ms ease-out both,
    kiosk-option-invite 8s 1.2s ease-in-out infinite;
}

.menu-order-kiosk-start__option:nth-child(2) {
  animation-delay: 270ms, 5.2s;
}
@keyframes kiosk-start-enter {
  from {
    opacity: 0;
    transform: translateY(calc(var(--spacing) * 5));
  }
}

@keyframes kiosk-option-enter {
  from {
    opacity: 0;
    transform: translateY(calc(var(--spacing) * 8)) scale(0.97);
  }
}

@keyframes kiosk-option-invite {
  0%, 12%, 100% {
    transform: translateY(0);
  }
  4%, 8% {
    transform: translateY(-0.16rem);
  }
}

.menu-order-kiosk-start__identity {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  text-align: center;
}

.menu-order-kiosk-start__identity h1,
.menu-order-kiosk-start__prompt h2 {
  margin: 0;
}

.menu-order-kiosk-start__prompt p {
  margin: calc(var(--spacing) * 3) 0 0;
  color: var(--menu-secondary);
  font-size: clamp(var(--text-base), 1.8vw, var(--text-xl));
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
}

.menu-order-kiosk-start__identity h1 {
  color: inherit;
  font-family: var(--menu-title-font);
  font-size: clamp(1.45rem, 3vw, 2.35rem);
  line-height: 1.1;
}

.menu-order-kiosk-start__wordmark {
  width: min(68vw, 50vh, 28rem);
  max-height: 28rem;
  object-fit: contain;
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
  color: inherit;
  font-family: var(--menu-title-font);
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: var(--font-weight-black);
  line-height: 1;
  letter-spacing: -0.04em;
}

.menu-order-kiosk-start__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(
    calc(var(--spacing) * 4),
    2vw,
    calc(var(--spacing) * 6)
  );
}

.menu-order-kiosk-start__options--portrait-cards {
  width: min(68%, 48rem);
}

.menu-order-kiosk-start__options--portrait-cards .menu-order-kiosk-start__option {
  aspect-ratio: 704 / 974;
  min-height: 0;
}

.menu-order-kiosk-start__option.menu-order-kiosk-start__option--artwork[data-menu-kiosk-mode] {
  overflow: visible; padding: 0;
  border: 0; border-radius: 0;
  background: transparent; box-shadow: none;
}
.menu-order-kiosk-start__option-artwork {
  width: 100%; height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1.15rem 1.35rem color-mix(in srgb, var(--menu-text) 22%, transparent));
}
.menu-order-kiosk-start__option {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
  align-items: center;
  justify-items: center;
  min-height: clamp(11rem, 16vh, 16rem);
  padding: clamp(
    calc(var(--spacing) * 5),
    2.8vw,
    calc(var(--spacing) * 8)
  );
  border: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-radius: var(--menu-radius-control);
  background: color-mix(in srgb, var(--menu-bg) 89%, var(--menu-primary));
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  text-align: center;
  box-shadow: 0 1.2rem 3rem color-mix(in srgb, var(--menu-text) 8%, transparent);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.menu-order-kiosk-start__option:hover,
.menu-order-kiosk-start__option:focus-visible {
  animation: none;
  border-color: color-mix(in srgb, var(--menu-primary) 58%, transparent);
  background: color-mix(in srgb, var(--menu-primary) 11%, var(--menu-bg));
  transform: translateY(-0.16rem);
}

.menu-order-kiosk-start__option--artwork[data-menu-kiosk-mode]:is(:hover, :focus-visible) {
  border-color: transparent;
  background: transparent;
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
  justify-items: center;
  min-width: 0;
}

.menu-order-kiosk-start__option-copy strong {
  color: var(--menu-title);
  font-size: clamp(1.55rem, 3vw, var(--text-4xl));
  letter-spacing: 0.035em;
  line-height: 1.1;
  text-transform: uppercase;
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
    gap: calc(var(--spacing) * 8);
    overflow-y: auto;
  }

  .menu-order-kiosk-start__options {
    grid-template-columns: 1fr;
  }

  .menu-order-kiosk-start__option {
    min-height: 6.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu-order-kiosk-start__identity,
  .menu-order-kiosk-start__prompt,
  .menu-order-kiosk-start__option,
  .menu-order-kiosk-start__product {
    animation: none;
  }
}
</style>
