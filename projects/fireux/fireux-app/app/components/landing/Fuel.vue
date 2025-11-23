<template>
  <ClientOnly>
    <UPageSection class="py-12 lg:py-16">
      <div class="flex items-center gap-3 mb-6">
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
    </UPageSection>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNuxtApp } from '#imports'

const nuxtApp = useNuxtApp()
const colorMode = nuxtApp.$colorMode as { value: string } | undefined
const isDark = computed(() => colorMode?.value === 'dark')

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
