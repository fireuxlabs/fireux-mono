<template>
  <UCard class="cell-card">
    <div class="cell-header">
      <UAvatar
        :src="employer?.avatarUrl || employer?.profile_image?.url"
        :alt="employer?.company_name || 'Employer'"
        size="md"
      />
      <div class="cell-info">
        <h4 v-if="employer?.company_name" class="cell-title">
          {{ employer.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="cell-subtitle">
          {{ employer.business_type }}
        </p>
      </div>
    </div>
    
    <div class="cell-content">
      <p v-if="employer?.bio_short" class="cell-description">
        {{ employer.bio_short }}
      </p>
      
      <div class="cell-tags" v-if="employer?.specialties?.length || employer?.cuisine_types?.length">
        <span 
          v-for="specialty in employer?.specialties?.slice(0, 2)" 
          :key="specialty"
          class="cell-tag"
        >
          {{ specialty }}
        </span>
        <span 
          v-for="cuisine in employer?.cuisine_types?.slice(0, 1)" 
          :key="cuisine"
          class="cell-tag cuisine"
        >
          {{ cuisine }}
        </span>
      </div>
      
      <div class="cell-stats" v-if="employer?.employee_count || employer?.years_established">
        <span v-if="employer?.employee_count" class="cell-stat">
          👥 {{ employer.employee_count }} employees
        </span>
        <span v-if="employer?.years_established" class="cell-stat">
          📅 {{ employer.years_established }} years
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  employer?: Partial<Employer>
}>()
</script>
