<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar :src="employer.avatar" :alt="employer.name" size="sm" />
      <div class="profile-info">
        <h4 class="profile-name">{{ employer.name }}</h4>
        <p v-if="employer.title" class="profile-title">{{ employer.title }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerPillProps } from '../../../../../models/profiles/Employer.model'

defineProps<{ employer: EmployerPillProps }>()
</script>
