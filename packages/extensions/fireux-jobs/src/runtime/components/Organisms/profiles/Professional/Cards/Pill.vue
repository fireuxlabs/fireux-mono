<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="professional.avatar"
        :alt="professional.display_name"
        size="sm"
      />
      <div class="profile-info">
        <h4 class="profile-name">{{ professional.display_name }}</h4>
        <p v-if="professional.title" class="profile-title">
          {{ professional.title }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'

defineProps<{ professional: ProfessionalCard.Pill }>()
</script>
