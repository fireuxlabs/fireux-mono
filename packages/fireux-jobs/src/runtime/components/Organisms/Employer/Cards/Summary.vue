<template>
  <div class="employer-summary">
    <div v-if="employer?.description" class="description">
      <h4 class="summary-title">About</h4>
      <p>{{ employer.description }}</p>
    </div>
    <div class="metadata">
      <div v-if="formattedCreatedDate" class="meta-item">
        <UIcon name="lucide:calendar" class="meta-icon" />
        <span>Joined {{ formattedCreatedDate }}</span>
      </div>
      <div v-if="employer?.website" class="meta-item">
        <UIcon name="lucide:globe" class="meta-icon" />
        <a :href="employer.website" target="_blank" class="website-link">
          {{ employer.website }}
        </a>
      </div>
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

const formattedCreatedDate = computed(() => {
  if (!props.employer?.createdAt) return null
  const date =
    typeof props.employer.createdAt === 'string'
      ? new Date(props.employer.createdAt)
      : props.employer.createdAt
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
})
</script>

<style scoped>
.employer-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.description p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.summary-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
}

.metadata {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.website-link {
  color: var(--primary-500);
  text-decoration: none;
}

.website-link:hover {
  text-decoration: underline;
}
</style>
