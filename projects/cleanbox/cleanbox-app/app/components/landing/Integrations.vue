<!-- COMMENT: app/components/landing/Integrations.vue -->
<template>
  <section class="px-4">
    <div class="integrations-container">
      <h2 class="fx-type-section-title section-title">Seamless Integrations</h2>
      <p class="fx-type-description section-subtitle">
        Connect with the tools your cleaning business already uses
      </p>

      <div class="integrations-grid">
        <Icon
          v-for="integration in integrations"
          :key="integration.name"
          :name="integration.icon"
          class="integration-icon"
          :title="integration.name"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Cleaning industry integrations
const integrations = [
  { name: 'Google Calendar', icon: 'logos:google-calendar' },
]
</script>

<style scoped>
.integrations-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: calc(var(--spacing) * 8) 0;
}

.section-title {
  margin-bottom: calc(var(--spacing) * 4);
}

.section-subtitle {
  margin-bottom: calc(var(--spacing) * 12);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.integrations-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 6);
  padding: calc(var(--spacing) * 4);
}

.integration-icon {
  width: 48px;
  height: 48px;
  transition: transform 0.2s ease;
}

.integration-icon:hover {
  transform: scale(1.1);
}
</style>
