<!-- COMMENT: app/components/Logo/Flame.vue -->
<template>
  <img
    ref="logoRef"
    src="/fireux-core/img/logo.png"
    alt="FIReUX Logo"
    class="logo mx-auto"
    :class="logoSizeClass"
  />
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'medium', // Default size
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
})

const logoRef = ref(null)

// Maintain the **3:4 aspect ratio**, ensure `mx-auto` centers horizontally
const logoSizeClass = computed(() => ({
  'h-6 w-auto aspect-[3/4] flex items-center justify-center':
    props.size === 'small', // 24px height
  'h-10 w-auto aspect-[3/4] flex items-center justify-center':
    props.size === 'medium', // 40px height
  'h-14 w-auto aspect-[3/4] flex items-center justify-center':
    props.size === 'large', // 56px height
}))
</script>

<style scoped>
.logo {
  object-fit: contain;
}
</style>
