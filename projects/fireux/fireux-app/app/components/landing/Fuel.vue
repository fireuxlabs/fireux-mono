<template>
  <ClientOnly>
    <div class="landing-index-section">
      <div class="mb-6 flex items-center justify-center gap-3 text-center">
        <LogoFlame size="small" />
        <h2 class="text-2xl lg:text-3xl font-bold">Fuel</h2>
      </div>

      <div class="flex flex-col md:flex-row items-center justify-center gap-8">
        <div class="fuel-item">
          <img :src="nuxtSrc" alt="Nuxt logo" />
        </div>
        <div class="fuel-item">
          <img :src="firebaseSrc" alt="Firebase logo" />
        </div>
        <div class="fuel-item">
          <img :src="stripeSrc" alt="Stripe logo" />
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResolvedColorMode } from 'fireux-core/runtime/composables/fireux/app/useColorMode'

const resolvedMode = useResolvedColorMode()
const isDark = computed(() => resolvedMode.value === 'dark')

const logos = {
  nuxt: {
    light: '/img/stack/nuxt-black.png',
    dark: '/img/stack/nuxt-white.png',
  },
  firebase: {
    light: '/img/stack/firebase-black.png',
    dark: '/img/stack/firebase-white.png',
  },
  stripe: {
    light: '/img/stack/stripe-black.png',
    dark: '/img/stack/stripe-white.png',
  },
}

const nuxtSrc = computed(() =>
  isDark.value ? logos.nuxt.dark : logos.nuxt.light
)
const firebaseSrc = computed(() =>
  isDark.value ? logos.firebase.dark : logos.firebase.light
)
const stripeSrc = computed(() =>
  isDark.value ? logos.stripe.dark : logos.stripe.light
)
</script>

<style scoped>
.fuel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background-color: var(--ui-bg);
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.fuel-item img {
  max-width: 120px;
  filter: grayscale(40%);
}

.fuel-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.fuel-item:hover img {
  filter: grayscale(0%);
}
</style>
