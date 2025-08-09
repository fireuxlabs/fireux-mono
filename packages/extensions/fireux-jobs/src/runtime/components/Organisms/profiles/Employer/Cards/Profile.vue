<template>
  <UCard class="profile-card profile-variant">
    <div class="profile-header">
      <UAvatar
        :src="employer?.avatarUrl || employer?.profile_image?.url"
        :alt="employer?.company_name || 'Employer'"
        size="lg"
        class="profile-avatar-large"
      />
      <h3 v-if="employer?.company_name" class="profile-title">
        {{ employer.company_name }}
      </h3>
      <p v-if="employer?.business_type" class="profile-subtitle-main">
        {{ employer.business_type }}
      </p>
      <div v-if="employer?.locations?.[0]" class="profile-location">
        📍 {{ employer.locations[0].short_address || employer.locations[0].formatted_address }}
      </div>
    </div>

    <div class="profile-body">
      <p v-if="employer?.bio_short" class="profile-description-main">
        {{ employer.bio_short }}
      </p>

      <div class="profile-highlights" v-if="employer?.employee_count || employer?.years_established">
        <div v-if="employer?.employee_count" class="profile-highlight">
          <span class="highlight-value">{{ employer.employee_count }}</span>
          <span class="highlight-label">Employees</span>
        </div>
        <div v-if="employer?.years_established" class="profile-highlight">
          <span class="highlight-value">{{ employer.years_established }}</span>
          <span class="highlight-label">Years</span>
        </div>
        <div v-if="employer?.covers_per_service" class="profile-highlight">
          <span class="highlight-value">{{ employer.covers_per_service }}</span>
          <span class="highlight-label">Covers/Service</span>
        </div>
        <div v-if="employer?.specialties?.length" class="profile-highlight">
          <span class="highlight-value">{{ employer.specialties.length }}</span>
          <span class="highlight-label">Specialties</span>
        </div>
      </div>

      <div class="profile-tags-main" v-if="employer?.specialties?.length || employer?.cuisine_types?.length">
        <span 
          v-for="specialty in employer?.specialties?.slice(0, 3)" 
          :key="specialty"
          class="profile-tag-main featured"
        >
          {{ specialty }}
        </span>
        <span 
          v-for="cuisine in employer?.cuisine_types?.slice(0, 2)" 
          :key="cuisine"
          class="profile-tag-main"
        >
          {{ cuisine }}
        </span>
      </div>
    </div>

    <div class="profile-footer">
      <div class="profile-badges-main">
        <span v-if="employer?.establishment_type?.length" class="profile-badge-main">
          🏢 {{ employer.establishment_type[0] }}
        </span>
        <span v-if="employer?.annual_revenue" class="profile-badge-main certified">
          💰 {{ employer.annual_revenue }}
        </span>
      </div>
      
      <div class="profile-contact">
        <button class="profile-action-btn">View</button>
        <button class="profile-action-btn primary">Contact</button>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  employer?: Partial<Employer>
}>()
</script>
