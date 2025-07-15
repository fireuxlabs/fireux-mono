<!-- COMMENT: app/components/landing/Integrations.vue -->
<template>
  <section class="px-4">
    <div class="integrations-container">
      <h2 class="section-title">Seamless Integrations</h2>
      <p class="section-subtitle">
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

<script setup>
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
  padding: 2rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.integrations-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
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
