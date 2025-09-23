<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="employer.avatar" :alt="employer.display_name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ employer.display_name }}</h4>
        <p v-if="employer.title" class="profile-title">{{ employer.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerCard } from '../../../../../models/profiles/Employer.model'

defineProps<{ employer: EmployerCard.Pill }>()
</script>
