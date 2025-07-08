<template>
  <UCard
    class="employer-cell"
    @click="navigateTo(`/employers/${employer.uid}`)"
  >
    <div class="employer-header">
      <UAvatar
        :src="employer.logoUrl"
        :alt="employer.companyName || 'Company'"
        size="md"
        :text="getInitials(employer.companyName)"
      />
      <div class="employer-info">
        <h3 class="employer-name">
          {{ employer.companyName || 'Unknown Company' }}
        </h3>
        <p v-if="employer.contactEmail" class="employer-email">
          {{ employer.contactEmail }}
        </p>
      </div>
    </div>

    <p v-if="employer.description" class="employer-description">
      {{ employer.description }}
    </p>

    <ULink
      v-if="employer.website"
      :to="employer.website"
      target="_blank"
      class="employer-website"
    >
      {{ formatWebsite(employer.website) }}
    </ULink>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  employer: {
    type: Object,
    required: true,
  },
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format website URL for display
function formatWebsite(url) {
  if (!url) return ''
  return url.replace(/^https?:\/\/(www\.)?/, '')
}
</script>

<style scoped>
.employer-cell {
  cursor: pointer;
  transition: all 0.2s ease;
}

.employer-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.employer-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.employer-info {
  flex: 1;
  min-width: 0;
}

.employer-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.employer-email {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: var(--space-1) 0 0 0;
}

.employer-description {
  font-size: 0.875rem;
  color: var(--ui-text);
  margin: 0 0 var(--space-2) 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.employer-website {
  font-size: 0.75rem;
  color: #1d4ed8;
  display: block;
  margin: var(--space-2) 0 0 0;
  text-decoration: none;
}

.employer-website:hover {
  text-decoration: underline;
}
</style>
