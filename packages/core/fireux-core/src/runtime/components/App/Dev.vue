<template>
  <div class="app-dev">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

// App Dev component - provides dev environment wrapper
// Can access props.data for debug information
</script>

<style scoped>
.app-dev {
  min-height: 100vh;
}
</style>
