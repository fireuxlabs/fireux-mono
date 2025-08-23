<template>
  <div v-if="devMode" class="dev-nav-container">
    <UButton
      to="/dev"
      color="primary"
      icon="i-heroicons-code-bracket"
      class="dev-nav-button"
    >
      Dev Tools
    </UButton>
  </div>
</template>

<script setup>
const { devMode } = useFireUXConfig()
</script>

<style scoped>
.dev-nav-container {
  position: relative;
}

.dev-nav-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  opacity: 0.9;
  transition: opacity 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dev-nav-button:hover {
  opacity: 1;
}
</style>
