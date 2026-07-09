<template>
  <section
    class="kiosk-background"
    :style="backgroundStyle"
    :aria-label="ariaLabel"
  >
    <img
      v-if="logoImageUrl"
      class="kiosk-background__logo"
      :src="logoImageUrl"
      :alt="kitchenName || ''"
    >

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
}>()

const backgroundStyle = computed(() => {
  const url = String(props.backgroundImageUrl || '').trim()

  return url
    ? {
        '--kiosk-background-image': `url('${url}')`,
        '--kiosk-primary': props.primaryColor || '#ff7912',
        '--kiosk-secondary': props.secondaryColor || '#050505',
      }
    : {
        '--kiosk-primary': props.primaryColor || '#ff7912',
        '--kiosk-secondary': props.secondaryColor || '#050505',
      }
})
</script>

<style scoped>
.kiosk-background {
  --kiosk-logo-size: min(24vw, 16.25rem);
  --kiosk-logo-top: 12.6svh;

  position: relative;
  display: block;
  height: 100svh;
  min-height: 100svh;
  overflow: hidden;
  background-image:
    linear-gradient(rgb(0 0 0 / 24%), rgb(0 0 0 / 38%)),
    var(
      --kiosk-background-image,
      linear-gradient(145deg, #111, #2a1204)
    );
  background-color: var(--kiosk-secondary, #050505);
  background-position: center, center;
  background-repeat: no-repeat;
  background-size: 100% 100%, auto 100%;
  color: white;
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
    --kiosk-logo-top: 11.5svh;
  }
}
</style>
