<template>
  <ClientOnly>
    <NuxtLink to="/" class="logo-link">
      <img
        :src="isDark ? logos.dark : logos.light"
        alt="FireUX logo"
        class="logo"
        :class="logoSizeClass"
      />
    </NuxtLink>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useColorMode } from '../../composables/fireux/app/useColorMode'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const logos = {
  // App-level wordmarks live under each project's public/img/app directory
  light: '/img/app/wordmark-light.png',
  dark: '/img/app/wordmark-dark.png',
}

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'hero'].includes(value),
  },
})

// Compute class based on size
const logoSizeClass = computed(() => ({
  'h-8': props.size === 'small',
  'h-12': props.size === 'medium',
  'h-16': props.size === 'large',
  'h-20': props.size === 'hero',
}))
</script>

<style scoped>
.logo-link {
  display: inline-block;
  width: fit-content;
  height: fit-content;
}

.logo {
  object-fit: contain;
  display: block;
}

/* Small size - 32px height, constrained width */
.logo.h-8 {
  height: 2rem; /* 32px */
  width: auto;
  max-width: 4rem; /* 64px - reasonable for small logo */
}

/* Medium size - 48px height, constrained width */
.logo.h-12 {
  height: 3rem; /* 48px */
  width: auto;
  max-width: 6rem; /* 96px */
}

/* Large size - 64px height, constrained width */
.logo.h-16 {
  height: 4rem; /* 64px */
  width: auto;
  max-width: 8rem; /* 128px */
}

/* Hero size - 80px height, constrained width */
.logo.h-20 {
  height: 5rem;
  width: auto;
  max-width: 10rem;
}
</style>
