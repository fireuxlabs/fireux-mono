<template>
  <section
    class="kiosk-background"
    :style="backgroundStyle"
    :data-kiosk-tone="tone || 'dark'"
    :aria-label="ariaLabel"
  >
    <img
      v-if="logoImageUrl"
      class="kiosk-background__logo"
      :src="logoImageUrl"
      :alt="kitchenName || ''"
    />

    <div class="kiosk-background__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  ariaLabel?: string
  backgroundImageUrl?: string
  kitchenName?: string
  logoImageUrl?: string
  primaryColor?: string
  secondaryColor?: string
  tone?: 'dark' | 'light'
}>()

const backgroundStyle = computed(() => {
  const url = String(props.backgroundImageUrl || '').trim()

  return url
    ? {
        '--kiosk-background-image': `url('${url}')`,
        '--kiosk-primary': props.primaryColor || '#ff7912',
        '--kiosk-secondary': props.secondaryColor || '#050505',
        '--kiosk-background-overlay':
          props.tone === 'light'
            ? 'linear-gradient(rgb(255 255 255 / 2%), rgb(255 255 255 / 8%))'
            : 'linear-gradient(rgb(0 0 0 / 24%), rgb(0 0 0 / 38%))',
      }
    : {
        '--kiosk-primary': props.primaryColor || '#ff7912',
        '--kiosk-secondary': props.secondaryColor || '#050505',
        '--kiosk-background-overlay':
          props.tone === 'light'
            ? 'linear-gradient(rgb(255 255 255 / 2%), rgb(255 255 255 / 8%))'
            : 'linear-gradient(rgb(0 0 0 / 24%), rgb(0 0 0 / 38%))',
      }
})
</script>

<style scoped>
.kiosk-background {
  --kiosk-logo-size: min(24vw, 16.25rem);
  --kiosk-logo-top: 12.6svh;
  --menu-bg: var(--kiosk-secondary, #050505);
  --menu-muted: rgb(255 255 255 / 72%);
  --menu-primary: var(--menu-theme-primary, var(--kiosk-primary, #ff7912));
  --menu-primary-source: var(
    --menu-theme-primary,
    var(--kiosk-primary, #ff7912)
  );
  --menu-text: white;
  --menu-title: white;

  position: relative;
  display: block;
  height: 100svh;
  min-height: 100svh;
  overflow: hidden;
  overscroll-behavior: none;
  background-image:
    var(--kiosk-background-overlay),
    var(--kiosk-background-image, linear-gradient(145deg, #111, #2a1204));
  background-color: var(--kiosk-secondary, #050505);
  background-position: center, center;
  background-repeat: no-repeat;
  background-size:
    100% 100%,
    auto 100%;
  color: white;
}

.kiosk-background[data-kiosk-tone='light'] {
  --menu-muted: rgb(3 55 35 / 70%);
  --menu-text: #033723;
  --menu-title: #033723;

  color: #033723;
}

.kiosk-background__logo {
  position: absolute;
  inset-inline: 0;
  top: var(--kiosk-logo-top);
  z-index: 0;
  width: var(--kiosk-logo-size);
  height: auto;
  max-height: var(--kiosk-logo-size);
  margin-inline: auto;
  object-fit: contain;
  pointer-events: none;
  transform: translateY(-50%);
}

.kiosk-background__content {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
  overscroll-behavior: none;
}

@media (max-width: 900px) {
  .kiosk-background {
    --kiosk-logo-size: min(22vw, 10.8rem);
    --kiosk-logo-top: 16.6svh;
  }
}

@media (max-width: 560px) {
  .kiosk-background {
    --kiosk-logo-size: min(25vw, 6.25rem);
    --kiosk-logo-top: 12.4svh;
  }
}
</style>
