<template>
  <UCard class="pill-card">
    <div class="pill-content">
      <UAvatar
        :src="employer?.avatarUrl"
        :alt="employer?.company_name || 'Employer'"
        size="sm"
        class="profile-avatar"
      />
      <div class="pill-info">
        <h4 v-if="employer?.company_name" class="pill-name">
          {{ employer.company_name }}
        </h4>
        <p v-if="employer?.business_type" class="pill-subtitle">
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
