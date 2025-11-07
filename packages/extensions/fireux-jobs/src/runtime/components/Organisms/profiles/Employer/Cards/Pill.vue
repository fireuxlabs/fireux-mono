<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="props.employer.avatar"
        :alt="props.employer.title || 'Employer'"
        :text="props.employer.initials"
        size="sm"
      />
      <div class="profile-info">
        <h4 class="profile-name">
          {{ props.employer.title || 'Employer' }}
        </h4>
        <p v-if="props.employer.subtitle" class="profile-title">
          {{ props.employer.subtitle }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerCard } from '../../../../../models/profiles/Employer.model'

const props = defineProps<{ employer: EmployerCard.Pill }>()
</script>
