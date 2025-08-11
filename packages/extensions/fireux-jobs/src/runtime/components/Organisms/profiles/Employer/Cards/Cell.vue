<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="employer?.avatarUrl"
        :alt="employer?.company_name || 'Employer'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="employer?.company_name" class="profile-name">
          {{ employer.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="profile-subtitle">
          {{ employer.business_type }}
        </p>
      </div>
    </div>

    <p v-if="employer?.bio_short" class="profile-bio">
      {{ employer.bio_short }}
    </p>

    <div v-if="employer?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in employer.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="employer.specialties.length > 3" class="tag-more">
        +{{ employer.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Employer } from '../../../../../models/profiles/Employer.model'

defineProps<{
  employer?: Partial<Employer>
}>()
</script>
