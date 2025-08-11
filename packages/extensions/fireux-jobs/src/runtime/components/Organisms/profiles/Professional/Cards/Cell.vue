<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="professional?.avatarUrl"
        :alt="professional?.professional_name || 'Professional'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="professional?.professional_name" class="profile-name">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
      </div>
    </div>

    <p v-if="professional?.bio_short" class="profile-bio">
      {{ professional.bio_short }}
    </p>

    <div v-if="professional?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in professional.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="professional.specialties.length > 3" class="tag-more">
        +{{ professional.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../../models/profiles/Professional.model'

defineProps<{
  professional?: Partial<Professional>
}>()
</script>
