<template>
  <nav class="dev-nav">
    <UButton
      v-for="link in links"
      :key="link.id"
      :to="link.to"
      :icon="link.icon"
      class="dev-nav-link"
    >
      {{ link.label }}
    </UButton>
  </nav>
</template>

<script setup>
const props = defineProps({
  links: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.dev-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}
.dev-nav-link {
  /* Add any dev nav specific styles here */
}
</style>
