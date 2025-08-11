<template>
  <UCard class="profile-card profile-pill">
    <div class="profile-header">
      <UAvatar
        :src="employer?.avatarUrl"
        :alt="employer?.company_name || 'Employer'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="employer?.company_name" class="profile-name">
          {{ employer.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="profile-title">
          {{ employer.business_type }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Employer } from '../../../../../models/profiles/Employer.model'

defineProps<{
  employer?: Partial<Employer>
}>()
</script>
