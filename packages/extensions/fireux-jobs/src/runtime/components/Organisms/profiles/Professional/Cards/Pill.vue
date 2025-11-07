<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="props.professional.avatar"
        :alt="props.professional.title || 'Professional'"
        :text="props.professional.initials"
        size="sm"
      />
      <div class="profile-info">
        <h4 class="profile-name">
          {{ props.professional.title || 'Professional' }}
        </h4>
        <p v-if="props.professional.subtitle" class="profile-title">
          {{ props.professional.subtitle }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'

const props = defineProps<{ professional: ProfessionalCard.Pill }>()
</script>
