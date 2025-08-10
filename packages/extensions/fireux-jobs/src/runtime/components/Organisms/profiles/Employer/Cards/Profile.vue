<template>
  <UCard class="profile-cell employer-cell">
    <div class="profile-header">
      <UAvatar
        :src="employer?.avatarUrl || employer?.profile_image?.url"
        :alt="employer?.company_name || 'Employer'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="employer?.company_name" class="profile-name">
          {{ employer.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="profile-subtitle">
          {{ employer.business_type }}
        </p>
        <div v-if="employer?.locations?.length" class="profile-location">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText(employer.locations[0]) }}</span>
        </div>
        <div v-if="employer?.years_established" class="profile-meta">
          Est. {{ employer.years_established }}
        </div>
      </div>
    </div>
    <p v-if="employer?.bio_long || employer?.bio_short" class="profile-bio">
      {{ employer.bio_long || employer.bio_short }}
    </p>

    <div
      v-if="employer?.specialties?.length || employer?.cuisine_types?.length"
      class="profile-tags"
    >
      <span
        v-for="specialty in (
          employer.specialties ||
          employer.cuisine_types ||
          []
        ).slice(0, 3)"
        :key="specialty"
        class="profile-tag"
      >
        {{ specialty }}
      </span>
      <span
        v-if="(employer.specialties || employer.cuisine_types || []).length > 3"
        class="profile-tag-more"
      >
        +{{
          (employer.specialties || employer.cuisine_types || []).length - 3
        }}
        more
      </span>
    </div>

    <div v-if="employer?.benefits?.length" class="profile-section">
      <strong class="section-label">Benefits:</strong>
      <span
        v-for="benefit in employer.benefits.slice(0, 2)"
        :key="benefit"
        class="profile-tag"
      >
        {{ benefit }}
      </span>
      <span v-if="employer.benefits.length > 2" class="profile-tag-more">
        +{{ employer.benefits.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="employer?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ employer.employee_count }} employees</span>
      </div>
      <div v-if="employer?.active_jobs?.length" class="profile-stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ employer.active_jobs.length }} open positions</span>
      </div>
      <div v-if="employer?.company_size" class="profile-stat">
        <UIcon name="i-lucide-building" />
        <span>{{ employer.company_size }} company</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Employer } from '../../../../../models/profiles/Employer.model'

defineProps<{
  employer?: Partial<Employer>
}>()

const getLocationText = (location: any) => {
  if (location?.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}
</script>
