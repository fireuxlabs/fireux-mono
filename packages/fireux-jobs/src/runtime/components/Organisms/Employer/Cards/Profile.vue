<template>
  <UCard>
    <div class="employer-profile-header">
      <UAvatar
        :src="employer?.logoUrl"
        :alt="employer?.companyName"
        size="xl"
        :text="getInitials(employer?.companyName)"
      />
      <div class="employer-info">
        <h2 class="employer-name">
          {{ employer?.companyName || 'Company' }}
        </h2>
        <p v-if="employer?.contactEmail" class="employer-email">
          {{ employer.contactEmail }}
        </p>
        <ULink
          v-if="employer?.website"
          :to="employer.website"
          target="_blank"
          class="employer-website"
        >
          {{ formatWebsite(employer.website) }}
        </ULink>
      </div>
    </div>

    <div v-if="employer?.description" class="employer-about">
      <h3 class="section-title">About the Company</h3>
      <p class="section-content">{{ employer.description }}</p>
    </div>

    <div v-if="employer?.industry" class="employer-metadata">
      <h3 class="section-title">Industry</h3>
      <p class="section-content">{{ employer.industry }}</p>
    </div>

    <div v-if="employer?.companySize" class="employer-metadata">
      <h3 class="section-title">Company Size</h3>
      <p class="section-content">{{ employer.companySize }}</p>
    </div>

    <div v-if="employer?.foundedYear" class="employer-metadata">
      <h3 class="section-title">Founded</h3>
      <p class="section-content">{{ employer.foundedYear }}</p>
    </div>
  </UCard>
</template>

<script setup>
// Props from parent
const props = defineProps({
  employer: {
    type: Object,
    default: null,
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
  // Remove protocol and www for display
  return url.replace(/^https?:\/\/(www\.)?/, '')
}
</script>

<style scoped>
.employer-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.employer-info {
  flex: 1;
  min-width: 0;
}

.employer-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.employer-email {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: var(--space-1) 0 0 0;
}

.employer-website {
  font-size: 0.875rem;
  color: #1d4ed8;
  text-decoration: none;
  margin: var(--space-1) 0 0 0;
  display: block;
}

.employer-website:hover {
  text-decoration: underline;
}

.employer-about,
.employer-metadata {
  margin-bottom: var(--space-4);
}

.employer-metadata:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-text);
  margin: 0 0 var(--space-2) 0;
}

.section-content {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: 0;
  line-height: 1.5;
}
</style>
