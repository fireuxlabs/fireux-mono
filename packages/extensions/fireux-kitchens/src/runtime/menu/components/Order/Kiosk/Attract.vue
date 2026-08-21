<template>
  <button
    type="button"
    class="menu-kiosk-attract"
    :style="backdropStyle"
    data-kiosk-skin="default"
    aria-label="Touch to start your order"
    @click="$emit('start')"
  >
    <span class="menu-kiosk-attract__shade" aria-hidden="true" />

    <span class="menu-kiosk-attract__content">
      <img
        v-if="identityImageUrl"
        :src="identityImageUrl"
        :alt="kitchenName"
        class="menu-kiosk-attract__identity"
      />
      <strong v-else class="menu-kiosk-attract__name">{{ kitchenName }}</strong>

      <span class="menu-kiosk-attract__promise">
        <small>Freshly made</small>
        <strong>Touch to order</strong>
      </span>

      <ClientOnly>
        <DotLottieVue
          class="menu-kiosk-attract__touch"
          autoplay
          loop
          :src="touchAnimationUrl"
        />
        <template #fallback>
          <UIcon
            class="menu-kiosk-attract__touch-fallback"
            name="i-lucide-hand"
          />
        </template>
      </ClientOnly>
      <UIcon
        class="menu-kiosk-attract__touch-fallback menu-kiosk-attract__touch-reduced"
        name="i-lucide-hand"
        aria-hidden="true"
      />

      <span class="menu-kiosk-attract__hint">Tap anywhere to begin</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { computed } from 'vue'

const props = defineProps<{
  backdropImageUrl?: string
  kitchenName: string
  logoImageUrl?: string
  wordmarkImageUrl?: string
}>()

defineEmits<{ (event: 'start'): void }>()

const touchAnimationUrl =
  'https://assets-v2.lottiefiles.com/a/27af7342-117c-11ee-afab-23d9d624d752/ZZ9yKT5Agj.lottie'
const identityImageUrl = computed(() =>
  String(props.wordmarkImageUrl || props.logoImageUrl || '').trim()
)
const backdropStyle = computed(() =>
  props.backdropImageUrl
    ? { '--menu-kiosk-attract-image': `url("${props.backdropImageUrl}")` }
    : undefined
)
</script>

<style scoped>
.menu-kiosk-attract {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  place-items: center;
  padding: 0;
  border: 0;
  background:
    linear-gradient(
      180deg,
      transparent 20%,
      rgb(0 0 0 / 28%) 58%,
      rgb(0 0 0 / 88%) 100%
    ),
    var(--menu-kiosk-attract-image),
    radial-gradient(circle at 50% 28%, var(--menu-primary), #07140c 68%);
  background-position: center;
  background-size: cover;
  color: white;
  cursor: pointer;
  font: inherit;
}

.menu-kiosk-attract__shade {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 50% 20%,
      transparent 0 16%,
      rgb(0 0 0 / 40%) 54%,
      rgb(0 0 0 / 82%) 100%
    ),
    linear-gradient(180deg, rgb(0 0 0 / 48%), transparent 32%, rgb(0 0 0 / 30%));
}

.menu-kiosk-attract__content {
  position: relative;
  display: grid;
  width: min(82%, 42rem);
  height: 100%;
  align-content: center;
  justify-items: center;
  gap: clamp(calc(var(--spacing) * 5), 3vh, calc(var(--spacing) * 14));
  padding: clamp(calc(var(--spacing) * 12), 8vh, calc(var(--spacing) * 32)) 0;
  text-align: center;
}

.menu-kiosk-attract__identity {
  width: min(68%, 24rem);
  max-height: 14rem;
  object-fit: contain;
  filter: drop-shadow(0 1rem 2.5rem rgb(0 0 0 / 52%));
}

.menu-kiosk-attract__name {
  font-family: var(--menu-title-font);
  font-size: clamp(3.4rem, 8vw, 7rem);
  line-height: 0.92;
}

.menu-kiosk-attract__promise {
  display: grid;
  gap: 0.55rem;
  text-transform: uppercase;
  text-shadow: 0 0.25rem 1.2rem rgb(0 0 0 / 65%);
}

.menu-kiosk-attract__promise small {
  font-size: clamp(0.9rem, 2vw, 1.35rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.24em;
}

.menu-kiosk-attract__promise strong {
  font-family: var(--menu-title-font);
  font-size: clamp(2.6rem, 7vw, var(--text-8xl));
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.menu-kiosk-attract__touch,
.menu-kiosk-attract__touch-fallback {
  width: clamp(8rem, 24vw, 15rem);
  height: clamp(8rem, 24vw, 15rem);
  filter: drop-shadow(
    0 0 2rem color-mix(in srgb, var(--menu-primary) 72%, transparent)
  );
}

.menu-kiosk-attract__touch {
  filter: brightness(0) invert(1);
}

.menu-kiosk-attract__touch-reduced {
  display: none;
}

.menu-kiosk-attract__touch-fallback {
  padding: 2.6rem;
  border: 0.18rem solid currentColor;
  border-radius: 9999px;
}

.menu-kiosk-attract__hint {
  font-size: clamp(var(--text-base), 2.4vw, var(--text-2xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-kiosk-attract:focus-visible {
  outline: 0.35rem solid var(--menu-primary);
  outline-offset: -0.55rem;
}

@media (prefers-reduced-motion: reduce) {
  .menu-kiosk-attract__touch {
    display: none;
  }
  .menu-kiosk-attract__touch-fallback {
    display: block;
  }
}
</style>
