<template>
  <ClientOnly>
    <UContainer>
      <NuxtLink to="/">
        <img
          :src="isDark ? logos.dark : logos.light"
          alt="FIReUX Logo"
          class="logo"
          :class="logoSizeClass"
        />
      </NuxtLink>
    </UContainer>
  </ClientOnly>
</template>

<script setup>
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const logos = {
  light: '/img/logo-type-light.svg',
  dark: '/img/logo-type-dark.svg',
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
  'h-20 mt-8 mb-8': props.size === 'hero',
}))
</script>
