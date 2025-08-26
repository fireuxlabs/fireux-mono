<template>
  <div class="layout-wrapper">
    <FireDevNav :links="devRoutes.miseboxDevRoutes || []" />
    <NuxtPage />
  </div>
</template>

<script setup>
const props = defineProps({
  devRoutes: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

.layout-wrapper > * {
  align-self: stretch;
}
</style>
