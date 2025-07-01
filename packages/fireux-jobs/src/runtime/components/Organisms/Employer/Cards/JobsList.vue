<template>
  <div class="jobs-list">
    <div v-if="!employerId" class="no-employer">
      <p>No employer ID provided</p>
    </div>
    <div v-else class="placeholder">
      <UIcon name="lucide:briefcase" class="placeholder-icon" />
      <p>Active jobs for this employer will appear here</p>
      <p class="sub-text">Job posting functionality coming soon</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  employerId: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.jobs-list {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-secondary);
}

.placeholder-icon {
  width: 2rem;
  height: 2rem;
  margin: 0 auto var(--space-2) auto;
  opacity: 0.5;
}

.sub-text {
  font-size: 0.875rem;
  margin-top: var(--space-1);
}

.no-employer {
  font-size: 0.875rem;
}
</style>
