<template>
  <div class="step-content">
    <p>Home copy, hero message, and starter product or service list.</p>
    <div class="requirements-block">
      <h3>What we need from you</h3>
      <ul class="requirements">
        <li v-for="(req, index) in requirements" :key="index">
          {{ req }}
        </li>
        <li v-if="!requirements.length">Basic brand assets and initial content.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    requirements?: string[]
  }>(),
  {
    requirements: () => [],
  }
)
</script>

<style scoped>
.step-content {
  margin-top: 1rem;
  padding-bottom: 1.5rem;
}

.requirements-block h3 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1rem;
}

.requirements {
  padding-left: 1.2rem;
  color: #374151;
}
</style>
