<template>
  <UCard class="profile-card profile-pill professional-pill">
    <div class="profile-header">
      <UAvatar
        :src="professional?.avatarUrl"
        :alt="professional?.professional_name || 'Professional'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="professional?.professional_name" class="profile-name">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="profile-title">
          {{ professional.title }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../../models/profiles/Professional.model'

defineProps<{
  professional?: Partial<Professional>
}>()
</script>
