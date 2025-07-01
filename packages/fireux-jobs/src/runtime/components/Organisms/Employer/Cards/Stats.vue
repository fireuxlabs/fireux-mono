<template>
  <div class="employer-stats">
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">0</div>
        <div class="stat-label">Active Jobs</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">0</div>
        <div class="stat-label">Applications</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">0</div>
        <div class="stat-label">Hires</div>
      </div>
    </div>
    <div class="stats-note">
      <p>Statistics will be calculated based on job posting activity</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  employer: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style scoped>
.employer-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.stat-item {
  text-align: center;
  padding: var(--space-2);
  border-radius: var(--border-radius);
  background-color: var(--bg-secondary);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-500);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.stats-note {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

.stats-note p {
  margin: 0;
}
</style>
