<template>
  <UCard class="profiles cards card employer-theme">
    <div class="header">
      <UAvatar
        :src="employer?.avatarUrl || employer?.profile_image?.url"
        :alt="employer?.company_name || 'Employer'"
        size="lg"
      />
      <div class="info">
        <h4 v-if="employer?.company_name" class="title">
          {{ employer.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="subtitle">
          {{ employer.business_type }}
        </p>
        <div v-if="employer?.locations?.length" class="stat">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText(employer.locations[0]) }}</span>
        </div>
      </div>
    </div>

    <p v-if="employer?.bio_short" class="description">
      {{ employer.bio_short }}
    </p>

    <div
      v-if="employer?.specialties?.length || employer?.cuisine_types?.length"
      class="tags"
    >
      <span
        v-for="specialty in (
          employer.specialties ||
          employer.cuisine_types ||
          []
        ).slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span
        v-if="(employer.specialties || employer.cuisine_types || []).length > 3"
        class="tag"
      >
        +{{
          (employer.specialties || employer.cuisine_types || []).length - 3
        }}
        more
      </span>
    </div>

    <div class="stats">
      <div v-if="employer?.employee_count" class="stat">
        <UIcon name="i-lucide-users" />
        <span>{{ employer.employee_count }} employees</span>
      </div>
      <div v-if="employer?.years_established" class="stat">
        <UIcon name="i-lucide-calendar" />
        <span>Est. {{ employer.years_established }}</span>
      </div>
      <div v-if="employer?.active_jobs?.length" class="stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ employer.active_jobs.length }} open positions</span>
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
