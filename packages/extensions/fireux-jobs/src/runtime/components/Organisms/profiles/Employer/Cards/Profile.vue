<template>
  <UCard class="profiles cards profile employer-theme">
    <div class="header">
      <div class="avatar-section">
        <UAvatar
          :src="employer?.avatarUrl || employer?.profile_image?.url"
          :alt="employer?.company_name || 'Employer'"
          size="xl"
        />
        <div v-if="employer?.verified" class="verification-badge">
          <UIcon name="i-lucide-check-circle" />
          <span>Verified Business</span>
        </div>
      </div>
      <div class="info">
        <h2 v-if="employer?.company_name" class="title">
          {{ employer.company_name }}
        </h2>
        <p v-if="employer?.business_type" class="subtitle">
          {{ employer.business_type }}
        </p>
        <div class="meta-stats">
          <div v-if="employer?.locations?.length" class="stat">
            <UIcon name="i-lucide-map-pin" />
            <span>{{ getLocationText(employer.locations[0]) }}</span>
          </div>
          <div v-if="employer?.website" class="stat">
            <UIcon name="i-lucide-globe" />
            <span>{{ employer.website }}</span>
          </div>
          <div v-if="employer?.employee_count" class="stat">
            <UIcon name="i-lucide-users" />
            <span>{{ employer.employee_count }} employees</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <UButton size="lg" color="primary">
          <UIcon name="i-lucide-briefcase" />
          View Jobs
        </UButton>
        <UButton variant="outline" size="lg">
          <UIcon name="i-lucide-building" />
          Company Info
        </UButton>
      </div>
    </div>

    <div v-if="employer?.bio_long || employer?.bio_short" class="description">
      {{ employer.bio_long || employer.bio_short }}
    </div>

    <div
      v-if="employer?.specialties?.length || employer?.cuisine_types?.length"
      class="tags"
    >
      <span
        v-for="specialty in employer.specialties ||
        employer.cuisine_types ||
        []"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
    </div>

    <div v-if="employer?.active_jobs?.length" class="jobs-section">
      <h3>Open Positions</h3>
      <div
        v-for="job in employer.active_jobs.slice(0, 3)"
        :key="job.id"
        class="job-item"
      >
        <div class="job-header">
          <div class="job-details">
            <h4 class="job-title">{{ job.title }}</h4>
            <p class="job-location">{{ job.location }}</p>
            <p class="job-type">
              {{ job.type }} • {{ job.salary_range || 'Salary negotiable' }}
            </p>
          </div>
        </div>
        <p v-if="job.description" class="job-description">
          {{ job.description }}
        </p>
      </div>
    </div>

    <div class="stats">
      <div v-if="employer?.years_established" class="stat">
        <UIcon name="i-lucide-calendar" />
        <span>Est. {{ employer.years_established }}</span>
      </div>
      <div v-if="employer?.total_jobs_posted" class="stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ employer.total_jobs_posted }} total jobs posted</span>
      </div>
      <div v-if="employer?.covers_per_service" class="stat">
        <UIcon name="i-lucide-users" />
        <span>{{ employer.covers_per_service }} covers per service</span>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  employer: {
    type: Object,
    required: false,
    default: () => null,
  },
})

const getLocationText = (location) => {
  if (location?.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}
</script>
