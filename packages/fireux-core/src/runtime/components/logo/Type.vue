<template>
  <ClientOnly>
    <NuxtLink to="/" class="logo-link">
      <img
        :src="isDark ? logos.dark : logos.light"
        alt="FIReUX Logo"
        class="logo"
        :class="logoSizeClass"
      />
    </NuxtLink>
  </ClientOnly>
</template>

<script setup>
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const logos = {
  light: '/fireux-core/img/logo-type-light.svg',
  dark: '/fireux-core/img/logo-type-dark.svg',
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
  height: 5rem; /* 80px */
  width: auto;
  max-width: 10rem; /* 160px */
  margin-top: 2rem;
  margin-bottom: 2rem;
}
</style>
